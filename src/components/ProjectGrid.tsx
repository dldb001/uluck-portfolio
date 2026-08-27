"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  animate,
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/lib/types";

type Props = {
  projects: Project[];
  /** 지금 호버 중인 카드 id (없으면 null) — 카드별 scale 판단용 */
  hoveredId?: string | null;
  /** 그리드 전체에 하나뿐인 hover 상태 — 헤드라인 blur 토글 + scale 공유 */
  onCardHoverChange?: (id: string | null) => void;
};

/** 이 거리(px) 이상 움직이면 클릭이 아니라 드래그로 간주 */
const DRAG_THRESHOLD = 5;

/**
 * 카드 바깥이어도 이만큼(px) 안쪽이면 "그 카드 위"로 쳐 준다.
 * 카드 사이 gap이 19.2px(모바일) / 28.8px(md)이라 이 값이면 gap 한가운데까지 덮여서,
 * 틈을 지날 때 hover가 꺼졌다 켜지는 대신 이웃 카드로 곧장 넘어간다.
 */
const HOVER_TOLERANCE = 24;

/**
 * 아무 카드도 못 잡았을 때 hover를 끄기까지 기다리는 시간(ms).
 * 그 사이에 카드를 다시 잡으면 예약을 취소하므로, 빠르게 움직이다 한두 프레임 놓쳐도
 * 효과가 끊기지 않는다. 그리드를 정말 벗어난 경우에만 이 지연 뒤에 꺼진다.
 */
const HOVER_CLEAR_DELAY = 120;

/**
 * 가로로 길게 배치된 카드들 — 화면 밖으로 넘쳐 잘려서 시작/끝난다.
 * - 마우스로 잡고 좌우 드래그하면 횡스크롤 (drag="x" + dragConstraints)
 * - 필터링 시 layout + AnimatePresence로 부드럽게 재배열
 */
export default function ProjectGrid({ projects, hoveredId = null, onCardHoverChange }: Props) {
  const router = useRouter();

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  /** 드래그 시작 지점 — 클릭/드래그 판별용 */
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const draggedRef = useRef(false);

  /** 마지막 포인터 좌표 — 마우스가 멈춰 있어도 카드가 움직이면 다시 판정해야 해서 들고 있는다 */
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  /** hover를 끄기로 예약해 둔 타이머 */
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [maxDrag, setMaxDrag] = useState(0);

  const cancelClear = useCallback(() => {
    if (clearTimer.current === null) return;
    clearTimeout(clearTimer.current);
    clearTimer.current = null;
  }, []);

  /**
   * 카드를 잡았으면 즉시 전환하고, 놓쳤으면 바로 끄지 않고 잠깐 예약만 해 둔다.
   * 예약이 끝나기 전에 카드를 다시 잡으면 위쪽 분기에서 예약이 취소된다.
   */
  const commitHover = useCallback(
    (id: string | null) => {
      if (id !== null) {
        cancelClear();
        onCardHoverChange?.(id);
        return;
      }
      if (clearTimer.current !== null) return;
      clearTimer.current = setTimeout(() => {
        clearTimer.current = null;
        onCardHoverChange?.(null);
      }, HOVER_CLEAR_DELAY);
    },
    [cancelClear, onCardHoverChange],
  );

  /**
   * 포인터가 어느 카드 위인지 좌표로 직접 판정한다.
   *
   * 카드마다 mouseenter/mouseleave를 붙이면 카드 사이 gap을 지날 때 leave → enter가 이어져
   * hover가 한 번 null로 떨어졌다 돌아오고, 그게 깜빡임으로 보인다. 여기서는 컨테이너에서
   * 한 번만 받아 "가장 가까운 카드"를 고르므로 gap 위에서도 항상 어느 한쪽이 잡혀 있다.
   *
   * 기준 사각형은 scale이 걸리는 안쪽 이미지 박스가 아니라 바깥 article의 레이아웃 박스다.
   * 확대/축소된 사각형을 쓰면 "커져서 더 잘 잡히고, 잡히니 더 커지는" 되먹임이 생긴다.
   */
  const hitTest = useCallback(() => {
    const track = trackRef.current;
    const point = lastPointer.current;
    // 필터 결과가 0건이면 트랙 자체가 렌더되지 않는다 — 잡을 카드가 없으니 꺼 준다
    if (!track) {
      commitHover(null);
      return;
    }
    if (!point) return;

    let bestId: string | null = null;
    let bestDist = Infinity;

    track.querySelectorAll<HTMLElement>("[data-card-id]").forEach((el) => {
      const r = el.getBoundingClientRect();
      // 사각형 안이면 두 값 모두 0 — 즉 거리 0이 된다
      const dx = Math.max(r.left - point.x, 0, point.x - r.right);
      const dy = Math.max(r.top - point.y, 0, point.y - r.bottom);
      const dist = Math.hypot(dx, dy);

      if (dist < bestDist) {
        bestDist = dist;
        bestId = el.dataset.cardId ?? null;
      }
    });

    commitHover(bestDist <= HOVER_TOLERANCE ? bestId : null);
  }, [commitHover]);

  const handleHoverMove = (e: React.PointerEvent) => {
    lastPointer.current = { x: e.clientX, y: e.clientY };
    hitTest();
  };

  // 드래그 관성으로 카드가 미끄러지는 동안엔 포인터가 멈춰 있어 pointermove가 오지 않는다.
  // 트랙 위치가 바뀔 때마다 마지막 좌표로 다시 판정해야 커서 아래 카드가 실제와 맞는다.
  useMotionValueEvent(x, "change", hitTest);

  // 필터로 목록이 바뀌면 커서 아래 카드도 달라진다 (호버 중이던 카드가 사라지는 경우 포함)
  useEffect(() => {
    hitTest();
  }, [hitTest, projects]);

  useEffect(() => cancelClear, [cancelClear]);

  /** 트랙이 뷰포트를 넘어가는 만큼만 왼쪽으로 끌 수 있게 제약을 계산 */
  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const overflow = track.scrollWidth - viewport.clientWidth;
    const next = Math.max(0, overflow);
    setMaxDrag(next);

    // 필터로 카드가 줄어 트랙이 짧아지면, 밀려 있던 위치를 되돌린다.
    if (x.get() < -next) x.set(-next);
  }, [x]);

  useLayoutEffect(() => {
    measure();
  }, [measure, projects]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure]);

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
    draggedRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const start = pointerStart.current;
    if (!start || draggedRef.current) return;
    if (Math.abs(e.clientX - start.x) > DRAG_THRESHOLD) {
      draggedRef.current = true;
    }
  };

  /** 키보드 탭 이동 시 화면 밖 카드를 트랙째 끌어와 보여준다 */
  const handleFocusCapture = (e: React.FocusEvent) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const view = viewport.getBoundingClientRect();
    const card = (e.target as HTMLElement).getBoundingClientRect();
    const margin = 24;

    let delta = 0;
    if (card.left < view.left + margin) delta = view.left + margin - card.left;
    else if (card.right > view.right - margin) delta = view.right - margin - card.right;
    if (delta === 0) return;

    const next = Math.min(0, Math.max(-maxDrag, x.get() + delta));
    animate(x, next, { type: "spring", stiffness: 260, damping: 34 });
  };

  /** threshold 미만이면 클릭 → 상세 페이지로 이동, 이상이면 라우팅 취소 */
  const handleActivate = (project: Project) => {
    if (draggedRef.current) return;
    router.push(project.href);
  };

  return (
    <section
      aria-label="프로젝트"
      // 그리드 높이를 뷰포트의 52%로 고정한다 — 카드 크기(100cqh 기반)의 기준이자,
      // 위쪽 히어로가 flex-1로 남는 공간을 차지해 그 안에서 가운데 정렬될 수 있게 하는 기준.
      className="flex h-[52dvh] w-full shrink-0 flex-col"
      // 그리드를 완전히 벗어난 경우 — 좌표 판정이 닿지 않는 곳이라 여기서 직접 끈다
      onPointerLeave={() => {
        lastPointer.current = null;
        commitHover(null);
      }}
    >
      {projects.length === 0 ? (
        <p className="px-[1.8rem] py-16 text-center text-sm text-ink/45 md:px-[3rem]">
          해당하는 프로젝트가 없습니다.
        </p>
      ) : (
        // container-type:size 로 이 요소가 컨테이너 쿼리 기준이 된다 —
        // 카드가 자기 폭을 `100cqh`(= 이 뷰포트의 높이)에서 역산할 수 있게 하는 장치.
        <div
          ref={viewportRef}
          // hover 판정은 카드가 아니라 여기서 한 번만 받는다 (트랙 위 이벤트도 여기로 올라온다)
          onPointerMove={handleHoverMove}
          className="flex h-full w-full items-center overflow-hidden [container-type:size]"
        >
          <LayoutGroup>
            <motion.div
              ref={trackRef}
              drag="x"
              style={{ x }}
              dragConstraints={{ left: -maxDrag, right: 0 }}
              dragElastic={0.06}
              dragMomentum
              dragTransition={{ power: 0.25, timeConstant: 320, bounceStiffness: 260, bounceDamping: 34 }}
              onPointerDownCapture={handlePointerDown}
              onPointerMoveCapture={handlePointerMove}
              onFocusCapture={handleFocusCapture}
              // gap / 좌우 패딩 모두 기준값의 120%
              className="flex w-max cursor-grab items-start gap-[1.2rem] px-[1.8rem] active:cursor-grabbing md:gap-[1.8rem] md:px-[3rem]"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isHovered={hoveredId === project.id}
                    // 다른 카드가 호버 중일 때만 축소 — 아무것도 호버 안 하면 전부 원래 크기
                    isDimmed={hoveredId !== null && hoveredId !== project.id}
                    onActivate={handleActivate}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        </div>
      )}
    </section>
  );
}
