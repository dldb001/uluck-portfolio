"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Project } from "@/lib/types";
import { PILL, PILL_PX, PILL_TEXT } from "@/lib/styles";

/** 호버 중 프레임이 바뀌는 간격(ms) */
const FRAME_MS = 500;

/** 프레임이 바뀔 때 새 장이 떠오르는 시간(ms) */
const FADE_MS = 180;

/** 모든 카드가 동일한 비율 (3:4 세로형) */
const CARD_ASPECT = "aspect-[3/4]";

/**
 * 카드 폭을 그리드가 쓸 수 있는 "높이"에서 역산한다 — 페이지가 세로로 넘치지 않게 하는 핵심.
 *
 * `100cqh` = ProjectGrid 뷰포트의 높이(그 요소에 container-type:size가 걸려 있다).
 * 거기서 캡션 높이를 빼면 이미지에 쓸 수 있는 높이가 나오고, 3:4 비율이므로 폭 = 그 높이 × 0.75.
 * 캡션은 제목 한 줄뿐이다 — mt-3(0.75rem) + line-height(모바일 1.25rem / md 1.5rem)
 * = 모바일 2rem / md 2.25rem. 아래 상수는 이 값과 반드시 일치해야 한다.
 *
 * 다시 1.06으로 나누는 건 호버 확대(scale 1.05) 몫이다.
 * 카드가 그리드 높이를 꽉 채우면 확대된 만큼이 그리드의 overflow-hidden에 잘리기 때문에,
 * 위아래로 각각 2.5%씩 삐져나갈 자리를 미리 비워둔다.
 *
 * 화면이 아주 높을 때 카드가 무한정 커지지 않도록 기존 고정 크기를 상한으로 남겨둔다.
 */
const CARD_WIDTH =
  "w-[calc((100cqh-2rem)*0.75/1.06)] max-w-[288px] md:w-[calc((100cqh-2.25rem)*0.75/1.06)] md:max-w-[408px]";

type Props = {
  project: Project;
  /** 이 카드가 호버 대상 */
  isHovered?: boolean;
  /** 다른 카드가 호버 중 */
  isDimmed?: boolean;
  /** 드래그 여부 판단 후 라우팅 (5단계에서 그리드가 주입) */
  onActivate?: (project: Project) => void;
};

export default function ProjectCard({
  project,
  isHovered = false,
  isDimmed = false,
  onActivate,
}: Props) {
  // 호버 대상은 살짝 커지고 나머지는 같이 작아진다 — 그리드 전체가 하나의 상태를 공유
  const scale = isHovered ? "scale-[1.05]" : isDimmed ? "scale-[0.95]" : "scale-100";

  /** 프레임이 여러 장이면 호버 중 순환, 아니면 thumbnail 한 장 */
  const frames = project.thumbnails?.length ? project.thumbnails : [project.thumbnail];

  /**
   * 지금 보여줄 장(current)과 직전 장(previous)을 함께 들고 있는다.
   *
   * 둘 다 필요한 이유는 깜빡임 때문이다. 나가는 장과 들어오는 장의 opacity를 동시에
   * 0↔1로 굴리면 전환 한가운데서 둘 다 반투명해져 뒤의 카드 배경(bg-ink/5)이 비쳐
   * 밝기가 한 번 튄다. 대신 직전 장을 불투명한 채로 아래에 깔아 두고 새 장만 그 위로
   * 떠오르게 하면, 화면이 어느 순간에도 불투명해서 튐 없이 이어진다.
   */
  const [{ current, previous }, setFrameState] = useState({ current: 0, previous: 0 });

  /** 로드가 끝난 프레임 — 아직 안 받아진 장으로 넘어가면 빈 배경이 스친다 */
  const loaded = useRef<boolean[]>([]);

  useEffect(() => {
    // 호버가 풀리면 언제나 첫 장으로 되돌린다 (돌아갈 때도 같은 크로스페이드를 탄다)
    if (!isHovered || frames.length < 2) {
      setFrameState((state) =>
        state.current === 0 ? state : { current: 0, previous: state.current },
      );
      return;
    }

    const id = setInterval(() => {
      setFrameState((state) => {
        // 다음 장부터 한 바퀴 돌며 "이미 로드가 끝난" 첫 장을 고른다.
        // 아직 아무 장도 준비되지 않았으면 같은 객체를 그대로 돌려 렌더를 건너뛰고,
        // 다음 tick에 다시 시도한다 — 덜 받아진 장으로 넘어가 깜빡이는 것보다 낫다.
        for (let step = 1; step <= frames.length; step += 1) {
          const next = (state.current + step) % frames.length;
          if (loaded.current[next]) return { current: next, previous: state.current };
        }
        return state;
      });
    }, FRAME_MS);

    return () => clearInterval(id);
  }, [isHovered, frames.length]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{
        layout: { type: "spring", stiffness: 320, damping: 34 },
        opacity: { duration: 0.25 },
        y: { duration: 0.25 },
      }}
      // 그리드가 이 요소의 사각형으로 hover 대상을 판정한다 (ProjectGrid의 hitTest 참고).
      // scale이 걸리는 안쪽 박스가 아니라 이 레이아웃 박스가 기준이어야 판정이 흔들리지 않는다.
      data-card-id={project.id}
      className={`${CARD_WIDTH} shrink-0`}
    >
      <div
        role="link"
        tabIndex={0}
        aria-label={`${project.title} 상세 보기`}
        onClick={() => onActivate?.(project)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onActivate?.(project);
          }
        }}
        className={`relative ${CARD_ASPECT} ${scale} w-full cursor-pointer overflow-hidden rounded-[10px] bg-ink/5 transition-transform duration-[350ms] ease-out will-change-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink`}
      >
        {/* 프레임을 전부 겹쳐 두고 opacity로 전환한다 — src를 갈아끼우면 매번 새로 받느라
            첫 바퀴에서 빈 화면이 스친다. 겹쳐 두면 카드가 화면에 들어올 때 함께 로드된다
            (= 호버하기 전에 미리 받아 둔다). 로드가 끝났는지는 onLoad로 표시해 두고,
            위 setInterval이 준비된 장으로만 넘어간다. */}
        {frames.map((src, i) => {
          const isCurrent = i === current;
          // 직전 장은 새 장이 다 떠오를 때까지 아래에 불투명하게 남아 배경이 비치지 않게 막는다
          const isPrevious = i === previous;

          return (
            <Image
              key={`${src}-${i}`}
              src={src}
              // 첫 장만 대표 이미지로 읽히게 하고 나머지는 장식 취급
              alt={i === 0 ? project.title : ""}
              aria-hidden={i > 0}
              fill
              draggable={false}
              sizes="(max-width: 768px) 288px, 408px"
              // 부드러운 그라디언트 아트워크라 기본 품질(75)에선 밴딩이 눈에 띈다
              quality={90}
              onLoad={() => {
                loaded.current[i] = true;
              }}
              // 새 장이 위(2), 직전 장이 그 아래(1), 나머지는 맨 뒤(0).
              // 쌓임 순서가 이래야 "아래는 불투명한 채로, 위만 서서히" 가 성립한다.
              style={{ zIndex: isCurrent ? 2 : isPrevious ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
              // 폭이 뷰포트 높이에 따라 달라지므로 위 sizes는 상한 기준(= max-w) 값이다
              // 확대/축소는 바깥 박스가 담당한다 (여기서 또 scale하면 효과가 겹친다)
              className={`no-select object-cover transition-opacity ease-out ${
                isCurrent || isPrevious ? "opacity-100" : "opacity-0"
              }`}
            />
          );
        })}

        {/* 카테고리 pill — 호버 중에만 나타난다.
            모양·글자 크기는 검색창 아래 카테고리 버튼과 같은 PILL 상수를 공유하고,
            이미지 위에 얹히므로 배경만 50% 투명한 크림으로 깐다.
            제목 아래 텍스트 표기는 그대로 두고 이건 추가 표시다.

            z-10은 필수다. 위 프레임들이 z-index 2까지 쓰는데, 양수 z-index는 z-index:auto인
            요소보다 나중에(위에) 그려진다. 이게 없으면 DOM 순서상 뒤에 있어도 현재 프레임
            이미지에 가려 아예 보이지 않는다. */}
        <span
          aria-hidden
          className={`${PILL} ${PILL_PX} ${PILL_TEXT} pointer-events-none absolute bottom-3 left-3 z-10 border-ink/20 bg-surface/50 text-ink transition-opacity duration-300 ease-out md:bottom-4 md:left-4 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {project.category.join(" · ")}
        </span>
      </div>

      {/* 캡션 높이는 CARD_WIDTH 계산에 상수로 들어가 있다 — 2rem(모바일) / 2.25rem(md).
          긴 제목이 카드 폭을 밀지 않도록 truncate로 한 줄 고정.
          카테고리는 이미지 안쪽 pill로만 표시하므로 여기엔 제목만 둔다. */}
      <h2 className="no-select mt-3 truncate text-sm/[1.25rem] font-medium tracking-tight text-ink md:text-base/[1.5rem]">
        {project.title}
      </h2>
    </motion.article>
  );
}
