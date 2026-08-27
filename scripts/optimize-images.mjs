/**
 * 이미지 최적화 — 리사이즈 → JPG 변환.
 *
 * 원본은 읽기만 한다. 결과는 --out 폴더(기본값: `<소스폴더>-optimized`)에 같은 이름의 .jpg로 저장한다.
 * 소스 폴더 자체에 쓰려면 --replace를 명시해야 한다.
 *
 * 옵션
 *   --out <폴더>      출력 폴더
 *   --replace         소스 폴더에 제자리 저장 (확장자가 바뀌면 원본 파일을 지운다)
 *   --width <px>      가로 폭 (기본 900)
 *   --quality <1-100> JPG 품질 (기본 82)
 *   --aspect 3:4|none 3:4는 중앙 기준 크롭, none은 원본 비율 유지 (기본 3:4)
 *   --include <정규식> 파일명이 매치되는 것만 처리
 *   --exclude <정규식> 파일명이 매치되는 것은 건너뜀
 *
 * 예시
 *   node scripts/optimize-images.mjs "public/images/a" --out "public/images/a/optimized" --width 1920 --quality 85 --aspect none
 */

import { mkdir, readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const INPUT_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff", ".avif"]);

/** 세로형 3:4 — ProjectCard의 aspect-[3/4]와 같은 비율 */
const CROP_ASPECT = 3 / 4;

const FLAGS = new Set(["replace"]);

function parseArgs(argv) {
  const [src, ...rest] = argv;
  const opts = {
    src,
    out: null,
    replace: false,
    width: 900,
    quality: 82,
    aspect: "3:4",
    include: null,
    exclude: null,
  };

  for (let i = 0; i < rest.length; i += 1) {
    const key = rest[i]?.replace(/^--/, "");
    if (FLAGS.has(key)) {
      opts[key] = true;
      continue;
    }
    const raw = rest[i + 1];
    if (key === "quality" || key === "width") opts[key] = Number(raw);
    else if (key === "out" || key === "aspect" || key === "include" || key === "exclude") {
      opts[key] = raw;
    }
    i += 1;
  }
  return opts;
}

const { src, out, replace, width, quality, aspect, include, exclude } = parseArgs(
  process.argv.slice(2),
);

if (!src) {
  console.error('사용법: node scripts/optimize-images.mjs "<소스 폴더>" [옵션] — 자세한 건 파일 상단 주석 참고');
  process.exit(1);
}

const srcDir = path.resolve(src);
const outDir = replace ? srcDir : out ? path.resolve(out) : `${srcDir}-optimized`;

// 실수로 원본을 덮어쓰는 걸 막는다 — 제자리 교체는 --replace로만 허용한다
if (outDir === srcDir && !replace) {
  console.error("출력 폴더가 소스 폴더와 같습니다. --out으로 다른 경로를 지정하거나 --replace를 쓰세요.");
  process.exit(1);
}

const cropToAspect = aspect !== "none";
const height = cropToAspect ? Math.round(width / CROP_ASPECT) : null;

await mkdir(outDir, { recursive: true });

const includeRe = include ? new RegExp(include) : null;
const excludeRe = exclude ? new RegExp(exclude) : null;

const entries = await readdir(srcDir, { withFileTypes: true });
const files = entries
  .filter((e) => e.isFile() && INPUT_EXT.has(path.extname(e.name).toLowerCase()))
  .map((e) => e.name)
  .filter((n) => (includeRe ? includeRe.test(n) : true))
  .filter((n) => (excludeRe ? !excludeRe.test(n) : true))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (files.length === 0) {
  console.error(`처리할 이미지가 없습니다: ${srcDir}`);
  process.exit(1);
}

console.log(
  `${files.length}개 → 폭 ${width}px${cropToAspect ? ` (3:4 중앙 크롭, ${width}x${height})` : " (원본 비율 유지)"}, JPG quality ${quality}`,
);
console.log(`출력: ${outDir}\n`);

let totalIn = 0;
let totalOut = 0;

/** 결과물의 실제 픽셀 크기 — manifest.json으로 남겨 앱이 비율을 알 수 있게 한다 */
const manifest = {};

for (const name of files) {
  const inPath = path.join(srcDir, name);
  const outPath = path.join(outDir, `${path.parse(name).name}.jpg`);

  const meta = await sharp(inPath).metadata();
  const before = await stat(inPath);

  const pipeline = sharp(inPath);

  if (cropToAspect) {
    // fit: "cover" + position: "centre" = 비율을 유지한 채 중앙 기준으로 넘치는 부분을 잘라낸다
    pipeline.resize(width, height, { fit: "cover", position: "centre" });
  } else {
    // 폭만 맞추고 세로는 비율대로. withoutEnlargement로 원본보다 키우지 않는다(업스케일 = 화질 저하)
    pipeline.resize({ width, withoutEnlargement: true });
  }

  // 같은 폴더에 쓸 수 있으므로 먼저 버퍼로 완전히 인코딩한 뒤 파일을 건드린다
  const buffer = await pipeline
    // 알파가 있는 PNG를 JPG로 바꾸면 투명 영역이 검게 나오므로 흰색으로 채운다
    .flatten({ background: "#ffffff" })
    // 그라디언트 아트워크는 색 정보를 줄이면 밴딩이 생기므로 크로마 서브샘플링을 끈다
    .jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();

  await writeFile(outPath, buffer);

  // 제자리 교체인데 확장자가 바뀐 경우(.png → .jpg) 원본 파일이 남으므로 지운다
  if (replace && inPath !== outPath) await unlink(inPath);

  const outMeta = await sharp(buffer).metadata();
  manifest[path.basename(outPath)] = { width: outMeta.width, height: outMeta.height };
  totalIn += before.size;
  totalOut += buffer.length;

  const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
  console.log(
    `${name}  ${meta.width}x${meta.height} ${kb(before.size)}` +
      `  →  ${path.basename(outPath)} ${outMeta.width}x${outMeta.height} ${kb(buffer.length)}`,
  );
}

/**
 * manifest.json — 파일명 → {width, height}.
 *
 * 앱이 이미지의 비율을 알아야 하는 곳에서 쓴다 (파노라마 판정 등). 여기서 같이 남겨야
 * 이미지를 다시 뽑을 때 자동으로 갱신되고, 손으로 적어 둔 값이 어긋날 일이 없다.
 *
 * 한 폴더에 여러 번 나눠 뽑는 경우가 있어서(예: 히어로만 다른 폭으로) 덮어쓰지 않고 합친다.
 */
const manifestPath = path.join(outDir, "manifest.json");
let previous = {};
try {
  previous = JSON.parse(await readFile(manifestPath, "utf8"));
} catch {
  // 아직 없으면 새로 만든다
}

const merged = { ...previous, ...manifest };
const sorted = Object.fromEntries(
  Object.keys(merged)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((k) => [k, merged[k]]),
);
await writeFile(manifestPath, `${JSON.stringify(sorted, null, 2)}\n`);

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)}MB`;
console.log(
  `\n합계 ${mb(totalIn)} → ${mb(totalOut)} (${(100 - (totalOut / totalIn) * 100).toFixed(1)}% 감소)`,
);
console.log(`manifest: ${manifestPath} (${Object.keys(sorted).length}개)`);
