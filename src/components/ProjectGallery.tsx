import Image from "next/image";
import type { CSSProperties } from "react";
import type { GalleryImage } from "@/lib/types";

/**
 * 상세 페이지 본문 이미지 그리드.
 *
 * 같은 크기가 계속 반복되면 단조로우므로 네 가지 블록을 순서대로 돌려 쓴다.
 * 블록마다 아래 여백이 달라서 세로로도 리듬이 생긴다 — 큰 이미지 뒤일수록 더 넉넉하게.
 *
 * 파노라마(아주 가로로 긴 그림)만 예외로 리듬에서 빼내 자기 행을 통째로 쓴다.
 * 아래 틀들은 비율이 고정이라, 그 안에 넣으면 object-cover가 좌우를 크게 잘라내기 때문이다.
 */
type BlockKind = "pano" | "full" | "duo" | "asym" | "trio";

const BLOCKS: { kind: BlockKind; count: number }[] = [
  { kind: "full", count: 1 },
  { kind: "duo", count: 2 },
  { kind: "asym", count: 2 },
  { kind: "trio", count: 3 },
];

/** 블록 아래 여백 — 큰 블록일수록 더 준다 */
const SPACING: Record<BlockKind, string> = {
  pano: "mb-[7vh]",
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

/** 비율을 모르면(manifest에 없으면) 파노라마 판정을 하지 않는다 */
function isPanorama(img: GalleryImage) {
  if (!img.width || !img.height) return false;
  return img.width / img.height >= PANORAMA_RATIO;
}

/**
 * 이미지 목록을 블록 순서대로 잘라 나눈다.
 *
 * 파노라마를 만나면 리듬 순서(cursor)를 건드리지 않고 그 자리에서 한 행을 빼 준다.
 * 순서를 소비하지 않으므로, 사이에 파노라마가 끼어도 나머지 이미지들의
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
    if (isPanorama(images[i])) {
      blocks.push({ kind: "pano", images: [images[i]] });
      i += 1;
      continue;
    }

    // 다음 파노라마(또는 목록 끝)까지 이어지는 일반 이미지 수.
    // 블록이 이 경계를 넘지 않아야 파노라마가 행 중간에 끼어들지 않는다.
    let run = 0;
    while (i + run < images.length && !isPanorama(images[i + run])) run += 1;

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

function Frame({
  img,
  className,
  style,
}: {
  img: GalleryImage;
  className: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[10px] bg-ink/5 ${className}`}
      style={style}
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
    </div>
  );
}

export default function ProjectGallery({ images }: { images: GalleryImage[] }) {
  const blocks = toBlocks(images);
  const gap = "gap-4 md:gap-6";

  return (
    <div>
      {blocks.map((block, i) => {
        const spacing = i === blocks.length - 1 ? "" : SPACING[block.kind];
        const [a, b, c] = block.images;

        // 파노라마 — 한 행을 통째로 쓰고, 틀의 비율을 그림에 맞춰 잘리는 데 없이 다 보여준다
        if (block.kind === "pano") {
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
              <Frame img={b} className="aspect-[4/3]" />
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
              <Frame img={bigFirst ? b : a} className={`h-full ${bigFirst ? "" : "order-1"}`} />
            </div>
          );
        }

        return (
          <div key={i} className={`grid grid-cols-3 gap-3 md:gap-4 ${spacing}`}>
            <Frame img={a} className="aspect-[3/4]" />
            <Frame img={b} className="aspect-[3/4]" />
            <Frame img={c} className="aspect-[3/4]" />
          </div>
        );
      })}
    </div>
  );
}
