import Image from "next/image";
import type { CSSProperties } from "react";
import {
  isGalleryRow,
  isGalleryText,
  isGalleryVideo,
  type GalleryImage,
  type GalleryItem,
  type GalleryLayout,
  type GalleryRow,
} from "@/lib/types";
import { BODY_TEXT, PROSE_W } from "@/lib/styles";
import Reveal from "./Reveal";
import YouTubeEmbed from "./YouTubeEmbed";

/**
 * 상세 페이지 본문 이미지 그리드.
 *
 * 같은 크기가 계속 반복되면 단조로우므로 네 가지 블록을 순서대로 돌려 쓴다.
 * 블록마다 아래 여백이 달라서 세로로도 리듬이 생긴다 — 큰 이미지 뒤일수록 더 넉넉하게.
 *
 * 파노라마(아주 가로로 긴 그림)와 solo로 표시한 이미지만 예외로 리듬에서 빼내 자기 행을
 * 통째로 쓴다. 아래 틀들은 비율이 고정이라, 그 안에 넣으면 object-cover가 가장자리를
 * 잘라내기 때문이다 — 파노라마는 좌우가 크게, 여백이 넉넉한 목업은 위아래가 잘린다.
 */
type BlockKind = "solo" | "full" | "duo" | "asym" | "trio";

const BLOCKS: { kind: BlockKind; count: number }[] = [
  { kind: "full", count: 1 },
  { kind: "duo", count: 2 },
  { kind: "asym", count: 2 },
  { kind: "trio", count: 3 },
];

/**
 * 같은 행에서 한 칸 뒤로 갈 때마다 늦추는 시간(초) — 행이 한 번에 뜨지 않고 왼쪽부터 차례로 올라온다.
 * 3열이어도 마지막 칸이 0.16초 늦는 정도라 흐름만 느껴지고 기다리게 하지는 않는다.
 */
const STAGGER = 0.08;

/** 블록 아래 여백 — 큰 블록일수록 더 준다 */
const SPACING: Record<BlockKind, string> = {
  solo: "mb-[7vh]",
  full: "mb-[9vh]",
  duo: "mb-[6vh]",
  asym: "mb-[7vh]",
  trio: "mb-[5vh]",
};

/**
 * 이 비율(가로 ÷ 세로) 이상이면 파노라마로 본다.
 * 가장 넓은 일반 틀이 16:9(1.78)라 그보다 확실히 넓은 2:1을 경계로 잡았다.
 * 예를 들어 3.57:1 그림을 16:9 틀에 넣으면 가로의 절반이 잘려 나간다.
 */
const PANORAMA_RATIO = 2;

/**
 * 자기 행을 통째로 쓰는 이미지인지 — 파노라마이거나 solo로 표시된 것.
 * 둘 다 틀의 비율을 그림에 맞춰야 하므로 크기를 모르면(manifest에 없으면) 해당하지 않는다.
 */
function isSolo(img: GalleryImage) {
  if (!img.width || !img.height) return false;
  return img.solo === true || img.width / img.height >= PANORAMA_RATIO;
}

/**
 * 이미지 목록을 블록 순서대로 잘라 나눈다.
 *
 * 파노라마·solo를 만나면 리듬 순서(cursor)를 건드리지 않고 그 자리에서 한 행을 빼 준다.
 * 순서를 소비하지 않으므로, 사이에 그런 이미지가 끼어도 나머지 이미지들의
 * full → duo → asym → trio 흐름은 그대로 이어진다.
 *
 * 마지막에 남은 장수가 블록 크기보다 적으면 그 수에 맞는 블록으로 대체해
 * 이미지가 잘려 나가거나 빈 칸이 생기지 않게 한다.
 */
function toBlocks(images: GalleryImage[]) {
  const blocks: { kind: BlockKind; images: GalleryImage[] }[] = [];
  let i = 0;
  let cursor = 0;

  while (i < images.length) {
    if (isSolo(images[i])) {
      blocks.push({ kind: "solo", images: [images[i]] });
      i += 1;
      continue;
    }

    // 다음 단독 행(또는 목록 끝)까지 이어지는 일반 이미지 수.
    // 블록이 이 경계를 넘지 않아야 단독 행 이미지가 블록 중간에 끼어들지 않는다.
    let run = 0;
    while (i + run < images.length && !isSolo(images[i + run])) run += 1;

    let { kind, count } = BLOCKS[cursor % BLOCKS.length];

    if (run < count) {
      // 남은 장수에 맞는 블록으로 낮춘다 (2장 → duo, 1장 → full)
      count = run;
      kind = run === 2 ? "duo" : "full";
    }

    blocks.push({ kind, images: images.slice(i, i + count) });
    i += count;
    cursor += 1;
  }

  return blocks;
}

/** 틀에 맞춰 object-cover로 채우는 이미지 한 칸 — 스크롤해 들어올 때 올라오며 나타난다 (Reveal) */
function Frame({
  img,
  className,
  style,
  delay,
}: {
  img: GalleryImage;
  className: string;
  style?: CSSProperties;
  delay?: number;
}) {
  return (
    <Reveal
      className={`relative overflow-hidden rounded-[10px] bg-ink/5 ${className}`}
      style={style}
      delay={delay}
    >
      <Image
        src={img.src}
        // 히어로에서 이미 프로젝트를 설명했으므로 본문 이미지는 장식 취급
        alt=""
        aria-hidden
        fill
        draggable={false}
        // 컨테이너 폭과 같은 식 — 고정 1152px로 두면 넓어진 폭에 비해 작은 후보를 골라 흐려진다
        sizes="(max-width: 768px) 100vw, calc((100vw + 72rem)/2)"
        // 부드러운 그라디언트 아트워크라 기본 품질(75)에선 밴딩이 눈에 띈다
        quality={90}
        className="no-select object-cover"
      />
    </Reveal>
  );
}

/** trio 레이아웃에서 한 세트에 들어가는 장수 */
const TRIO_COLUMNS = 3;

/**
 * 3장씩 같은 크기로만 늘어놓는 배치.
 *
 * 기본(rhythm) 배치는 블록 크기를 섞어 강약을 주지만, 본문이 전부 같은 비율이고 장수가 많으면
 * 그 강약이 오히려 산만해진다. 그럴 때 이 배치를 쓴다.
 *
 * 마지막 세트가 3장 미만이면 남는 장수만큼만 놓는다 — grid-cols-3라 칸 폭은 그대로 유지되고
 * 왼쪽부터 채워진다 (2장이면 오른쪽 한 칸이 빈다).
 */
function TrioGallery({ images }: { images: GalleryImage[] }) {
  // 모든 칸이 같은 크기여야 하므로 비율은 하나로 고정한다. 첫 장의 실제 비율을 그대로 쓰면
  // (본문이 같은 비율일 때) 어디도 잘리지 않는다. 크기를 모르면 기본 3열 블록과 같은 3:4.
  const sized = images.find((img) => img.width && img.height);
  const aspectRatio = sized ? `${sized.width} / ${sized.height}` : "3 / 4";

  const sets: GalleryImage[][] = [];
  for (let i = 0; i < images.length; i += TRIO_COLUMNS) {
    sets.push(images.slice(i, i + TRIO_COLUMNS));
  }

  return (
    <div>
      {sets.map((set, i) => (
        <div
          key={i}
          // 세트 사이 여백은 기본 배치의 3열 블록과 같은 값을 쓴다 (마지막 세트 뒤에는 두지 않는다)
          className={`grid grid-cols-3 gap-3 md:gap-4 ${i === sets.length - 1 ? "" : SPACING.trio}`}
        >
          {set.map((img, j) => (
            <Frame
              key={j}
              img={img}
              className="w-full"
              style={{ aspectRatio }}
              delay={j * STAGGER}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * 직접 지정한 행(GalleryRow) 하나 — 칸 폭이 모두 같아 높이도 저절로 맞는다.
 *
 * 비율은 첫 장의 원본 비율을 행 전체가 나눠 쓴다. 같은 비율끼리 묶으면 object-cover가 잘라낼
 * 게 없고, 다른 비율이 섞인 경우에만 그 장의 가장자리가 잘린다. 열 수는 장수를 그대로 따르므로
 * (2장 → 2열, 3장 → 3열) Tailwind의 grid-cols-* 대신 인라인 스타일로 넘긴다 — 클래스명을
 * 문자열로 조합하면 Tailwind가 빌드 때 찾지 못해 스타일이 빠진다.
 *
 * 칸 사이 여백은 기본 배치의 3열 블록과 같은 값을 쓴다.
 */
function FixedRow({ images }: { images: GalleryImage[] }) {
  const sized = images.find((img) => img.width && img.height);
  const aspectRatio = sized ? `${sized.width} / ${sized.height}` : "1 / 1";

  return (
    <div
      className="grid gap-3 md:gap-4"
      style={{ gridTemplateColumns: `repeat(${images.length}, minmax(0, 1fr))` }}
    >
      {images.map((img, i) => (
        <Frame
          key={i}
          img={img}
          className="w-full"
          style={{ aspectRatio }}
          delay={i * STAGGER}
        />
      ))}
    </div>
  );
}

/**
 * 직접 지정한 행을 낱장으로 푼다.
 *
 * rhythm·trio는 자기 규칙으로 이미지를 묶기 때문에 행 지정을 지킬 자리가 없다. 무시하고
 * 흘려보내는 대신 여기서 명시적으로 펼쳐서, 행을 섞어 둔 프로젝트가 배치를 바꿔도
 * 이미지가 사라지지 않게 한다.
 */
function flattenRows(items: (GalleryImage | GalleryRow)[]): GalleryImage[] {
  return items.flatMap((item) => (isGalleryRow(item) ? item.row : item));
}

/** 원본 비율을 지키는 배치에서 한 장이 차지할 수 있는 최대 높이 */
/**
 * 이 비율(가로 ÷ 세로) 이상이면 짝을 짓지 않고 한 행을 통째로 쓴다.
 *
 * 세로 이미지는 두 장을 나란히 놓아야 화면이 낭비되지 않지만, 가로로 긴 이미지는 반 칸에
 * 넣으면 아주 작아진다. 1.2를 경계로 둔 건 정사각에 가까운 이미지까지는 짝을 짓게 하기 위해서다.
 */
const NATURAL_SOLO_RATIO = 1.2;

/**
 * natural 배치의 이미지 한 장 — 틀 없이 자기 자리를 채운다.
 *
 * 높이 상한을 두지 않는 건 폭을 기준으로 삼기 위해서다. 상한이 걸리면 이미지가 칸보다
 * 좁아지는데, 그러면 2열의 두 장 사이가 gap보다 벌어지고 단독 행도 2열 영역보다 좁아져
 * 좌우 끝이 어긋난다. 폭을 항상 칸에 맞추면 창 높이와 무관하게 끝이 맞는다.
 * 세로는 w-full + h-auto라 원본 비율대로 따라온다.
 */
function NaturalImage({
  img,
  sizes,
  delay,
}: {
  img: GalleryImage;
  sizes: string;
  delay?: number;
}) {
  // 크기를 모르면 비율을 잡을 수 없다 — 16:9 상자 안에 contain으로 넣어 잘림만 막는다
  if (!img.width || !img.height) {
    return (
      <Reveal className="relative aspect-[16/9] w-full" delay={delay}>
        <Image
          src={img.src}
          alt=""
          aria-hidden
          fill
          draggable={false}
          sizes={sizes}
          quality={90}
          className="no-select rounded-[10px] object-contain"
        />
      </Reveal>
    );
  }

  return (
    <Reveal delay={delay}>
      <Image
        src={img.src}
        // 히어로에서 이미 프로젝트를 설명했으므로 본문 이미지는 장식 취급
        alt=""
        aria-hidden
        width={img.width}
        height={img.height}
        draggable={false}
        sizes={sizes}
        quality={90}
        // w-full + h-auto: 폭은 칸을 꽉 채우고 높이는 비율이 정한다.
        // 상자가 그림과 같은 비율이라 object-contain으로도 빈 띠가 생기지 않는다.
        // block: 이제 그리드·flex 항목은 Reveal 상자이고 이미지는 그 안에 든다. inline 그대로면
        // 글자 기준선 아래 틈만큼 상자가 길어진다.
        className="no-select block h-auto w-full rounded-[10px] object-contain"
      />
    </Reveal>
  );
}

/**
 * 원본 비율 그대로 놓는 배치.
 *
 * 다른 배치는 정해진 비율의 틀에 object-cover로 채워 넣기 때문에 틀과 비율이 다른 이미지는
 * 가장자리가 잘린다. 여기서는 틀을 두지 않고 이미지 자체의 크기(manifest)로 자리를 잡아
 * 어디도 잘리지 않게 한다.
 *
 * 세로 이미지는 두 장씩 짝을 지어 나란히 놓고, 가로로 긴 이미지(NATURAL_SOLO_RATIO 이상)는
 * 한 행을 통째로 써서 크게 보여준다. 한 행의 두 장은 비율에 따라 폭이 서로 다를 수 있다 —
 * 크기를 맞추려면 잘라야 하므로 여기서는 안 자르는 쪽을 택한다.
 *
 * 짝이 홀수로 남으면 마지막 한 장이 왼쪽 칸에 혼자 놓인다.
 *
 * 이 자동 판정이 원하는 모양을 못 만들 때는 GalleryRow로 행을 직접 짜서 섞으면 된다.
 * 그 행은 비율과 무관하게 지정한 장수 그대로 한 행이 되고, 칸 폭이 같아 높이도 맞는다
 * (FixedRow 참고 — 대신 그 행만 틀에 맞춰 object-cover로 잘린다).
 */
function NaturalGallery({ items }: { items: (GalleryImage | GalleryRow)[] }) {
  const rows: { kind: "solo" | "pair" | "fixed"; images: GalleryImage[] }[] = [];

  for (const item of items) {
    // 직접 지정한 행 — 자동 판정을 건너뛰고 그대로 한 행이 된다
    if (isGalleryRow(item)) {
      rows.push({ kind: "fixed", images: item.row });
      continue;
    }

    const ratio = item.width && item.height ? item.width / item.height : 0;

    if (ratio >= NATURAL_SOLO_RATIO) {
      rows.push({ kind: "solo", images: [item] });
      continue;
    }

    const open = rows[rows.length - 1];
    // 직전 행이 아직 한 장짜리 짝 행이면 거기에 채운다
    if (open && open.kind === "pair" && open.images.length < 2) open.images.push(item);
    else rows.push({ kind: "pair", images: [item] });
  }

  return (
    <div className="flex flex-col gap-[4vh]">
      {rows.map((row, i) => {
        if (row.kind === "fixed") return <FixedRow key={i} images={row.images} />;

        if (row.kind === "solo") {
          return (
            <NaturalImage
              key={i}
              img={row.images[0]}
              // 본문 컨테이너 폭과 같은 식 (Frame과 동일)
              sizes="(max-width: 768px) 100vw, calc((100vw + 72rem)/2)"
            />
          );
        }

        return (
          <div key={i} className="grid grid-cols-2 items-center gap-2 md:gap-3">
            {row.images.map((img, j) => (
              <NaturalImage
                key={j}
                img={img}
                sizes="(max-width: 768px) 50vw, 45vw"
                delay={j * STAGGER}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

/**
 * 항목 목록을 문단·영상 경계로 나눈다 — [이미지들] 문단 영상 [이미지들] ... 순서를 그대로 보존한다.
 * 경계가 없으면 이미지 묶음 하나뿐이다. 직접 지정한 행(GalleryRow)은 경계가 아니라
 * 이미지 묶음 안에 그대로 들어간다 — 행을 어떻게 다룰지는 배치가 정한다.
 */
function toSegments(items: GalleryItem[]) {
  const segments: (
    | { kind: "images"; items: (GalleryImage | GalleryRow)[] }
    | { kind: "text"; text: string }
    | { kind: "video"; videos: { youtube: string; poster?: string }[] }
  )[] = [];

  for (const item of items) {
    if (isGalleryText(item)) {
      segments.push({ kind: "text", text: item.text });
      continue;
    }
    if (isGalleryVideo(item)) {
      // 영상이 연달아 오면 한 행으로 묶는다 (VideoRow 참고)
      const prev = segments[segments.length - 1];
      const video = { youtube: item.youtube, poster: item.poster };
      if (prev && prev.kind === "video") prev.videos.push(video);
      else segments.push({ kind: "video", videos: [video] });
      continue;
    }
    const open = segments[segments.length - 1];
    if (open && open.kind === "images") open.items.push(item);
    else segments.push({ kind: "images", items: [item] });
  }

  return segments;
}

/**
 * 그리드 사이 문단 — 소개 문단(work/[id]/page.tsx)과 같은 폭·같은 왼쪽 시작점이고 글자만 1.2배다.
 *
 * 위 여백은 앞 이미지 블록의 아래 여백(SPACING)과 겹쳐 큰 쪽만 남는다 (마진 상쇄).
 *
 * 맨 앞에 오는 문단은 바로 위 소개 문단에 이어지는 글이라 이미지 사이 여백(6vh) 대신
 * 빈 줄 하나만큼(1.9em = 줄 간격 한 줄)만 띄운다. 소개 문단 섹션은 이 경우 아래 패딩을
 * 두지 않는다 (work/[id]/page.tsx) — 패딩은 마진과 상쇄되지 않아 그대로 더해지기 때문이다.
 *
 * chapter가 있으면(문단이 둘 이상인 프로젝트 — KBS의 편성 셋처럼) 문단이 챕터의 첫머리가 된다.
 * 번호(01, 02 …)와 오른쪽 끝까지 뻗는 머리카락 선을 문단 위에 얹고, 위 여백도 이미지 사이
 * 여백의 두 배로 벌려 앞 챕터가 끝나고 다음 챕터가 시작된다는 게 보이게 한다.
 * 맨 앞 챕터는 선이 소개 문단에 붙으면 답답하므로 빈 줄 대신 이미지 사이 여백만큼 띄운다.
 * 번호는 메타 라벨(work/[id]/page.tsx)과 같은 자간·옅은 색 계열이고 크기만 조금 키웠다.
 */
function Paragraph({
  text,
  first,
  chapter,
}: {
  text: string;
  first: boolean;
  chapter?: number;
}) {
  if (chapter === undefined) {
    return (
      <p className={`${PROSE_W} ${BODY_TEXT} ${first ? "mt-[1.9em]" : "mt-[6vh]"} mb-[6vh]`}>
        {text}
      </p>
    );
  }

  return (
    <div className={`${PROSE_W} ${first ? "mt-[6vh]" : "mt-[12vh]"} mb-[6vh]`}>
      <div className="mb-5 flex items-center gap-4" aria-hidden>
        <span className="text-[11px] font-semibold tabular-nums tracking-[0.16em] text-ink/40">
          {String(chapter).padStart(2, "0")}
        </span>
        <span className="h-px flex-1 bg-ink/10" />
      </div>
      <p className={BODY_TEXT}>{text}</p>
    </div>
  );
}

/**
 * 그리드 사이 영상 행 — 한 편이면 본문 영역 전체 폭의 16:9, 연달아 온 여러 편이면 같은 폭으로 나란히.
 *
 * 열 수는 편수를 그대로 따르므로 FixedRow처럼 인라인 스타일로 넘긴다. 칸 사이 여백도 FixedRow와 같다.
 *
 * 아래 여백은 natural 배치의 행 사이 간격(4vh)과 같다. 영상은 보통 편성 문단 바로 뒤, 그 편성의
 * 스타일프레임 바로 앞에 오므로 뒤의 이미지들과 한 덩어리로 읽히게 이미지 행 간격만 둔다.
 * 맨 끝에 오면 여백을 두지 않는다 (상세 페이지 섹션의 아래 패딩이 대신한다).
 */
function VideoRow({
  videos,
  last,
}: {
  videos: { youtube: string; poster?: string }[];
  last: boolean;
}) {
  return (
    <div
      className={`grid gap-3 md:gap-4 ${last ? "" : "mb-[4vh]"}`}
      style={{ gridTemplateColumns: `repeat(${videos.length}, minmax(0, 1fr))` }}
    >
      {videos.map((v, i) => (
        <Reveal key={v.youtube} delay={i * STAGGER}>
          <YouTubeEmbed id={v.youtube} poster={v.poster} />
        </Reveal>
      ))}
    </div>
  );
}

export default function ProjectGallery({
  images,
  layout = "rhythm",
}: {
  images: GalleryItem[];
  layout?: GalleryLayout;
}) {
  const segments = toSegments(images);

  // 문단이 하나라도 있으면 이미지 묶음마다 배치를 따로 돌린다 — 묶음 안에서는 아래와 같은 규칙이다
  if (segments.length > 1) {
    // 문단이 둘 이상이면 본문이 여러 챕터로 나뉜 것으로 보고 문단마다 번호를 붙인다.
    // 문단이 하나뿐인 프로젝트는 나눌 게 없으므로 번호 없이 그대로 둔다.
    const chaptered = segments.filter((seg) => seg.kind === "text").length > 1;
    let chapter = 0;

    return (
      <div>
        {segments.map((seg, i) =>
          seg.kind === "text" ? (
            <Paragraph
              key={i}
              text={seg.text}
              first={i === 0}
              chapter={chaptered ? ++chapter : undefined}
            />
          ) : seg.kind === "video" ? (
            <VideoRow key={i} videos={seg.videos} last={i === segments.length - 1} />
          ) : (
            <div key={i} className={i === segments.length - 1 ? "" : "mb-[6vh]"}>
              <ProjectGallery images={seg.items} layout={layout} />
            </div>
          ),
        )}
      </div>
    );
  }

  const only = segments[0];
  if (only?.kind === "video") return <VideoRow videos={only.videos} last />;
  if (!only || only.kind !== "images") return null;

  if (layout === "natural") return <NaturalGallery items={only.items} />;

  // rhythm·trio는 자기 규칙으로 묶으므로 직접 지정한 행은 낱장으로 풀어 넘긴다
  const plain = flattenRows(only.items);

  if (layout === "trio") return <TrioGallery images={plain} />;

  const blocks = toBlocks(plain);
  const gap = "gap-4 md:gap-6";

  return (
    <div>
      {blocks.map((block, i) => {
        const spacing = i === blocks.length - 1 ? "" : SPACING[block.kind];
        const [a, b, c] = block.images;

        // 파노라마·solo — 한 행을 통째로 쓰고, 틀의 비율을 그림에 맞춰 잘리는 데 없이 다 보여준다
        if (block.kind === "solo") {
          return (
            <div key={i} className={spacing}>
              <Frame
                img={a}
                className="w-full"
                style={{ aspectRatio: `${a.width} / ${a.height}` }}
              />
            </div>
          );
        }

        if (block.kind === "full") {
          return (
            <div key={i} className={spacing}>
              <Frame img={a} className="aspect-[16/9] w-full" />
            </div>
          );
        }

        if (block.kind === "duo") {
          return (
            <div key={i} className={`grid grid-cols-2 ${gap} ${spacing}`}>
              <Frame img={a} className="aspect-[4/3]" />
              <Frame img={b} className="aspect-[4/3]" delay={STAGGER} />
            </div>
          );
        }

        // 비대칭 2열 — 큰 이미지가 2칸, 작은 이미지가 1칸 (블록마다 좌우를 번갈아 준다)
        if (block.kind === "asym") {
          const bigFirst = i % 2 === 0;
          return (
            // items-stretch로 두 칸이 같은 행 높이를 갖게 한다.
            // 행 높이는 큰 이미지의 16:9 하나가 정하고, 작은 이미지는 h-full로 거기에 맞춘다.
            // (작은 쪽에 aspect-[3/4]를 주면 자기 비율대로 높이를 따로 잡아 두 칸이 어긋난다.
            //  높이를 맞춘 뒤에도 안쪽 object-cover가 원본 비율을 지키며 넘치는 부분만 잘라낸다)
            <div key={i} className={`grid grid-cols-3 items-stretch ${gap} ${spacing}`}>
              <Frame
                img={bigFirst ? a : b}
                className={`aspect-[16/9] col-span-2 ${bigFirst ? "" : "order-2"}`}
              />
              <Frame
                img={bigFirst ? b : a}
                className={`h-full ${bigFirst ? "" : "order-1"}`}
                delay={STAGGER}
              />
            </div>
          );
        }

        return (
          <div key={i} className={`grid grid-cols-3 gap-3 md:gap-4 ${spacing}`}>
            <Frame img={a} className="aspect-[3/4]" />
            <Frame img={b} className="aspect-[3/4]" delay={STAGGER} />
            <Frame img={c} className="aspect-[3/4]" delay={STAGGER * 2} />
          </div>
        );
      })}
    </div>
  );
}
