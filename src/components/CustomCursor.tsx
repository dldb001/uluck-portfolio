"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCardHover } from "@/components/CardHoverProvider";

/** 원 지름(px) — 아래 음수 마진이 이 값의 절반이라 좌표에 정확히 중심이 맞는다 */
const SIZE = 7;

/** 지연을 거의 없앤 spring — 임계감쇠(2√(k·m) ≈ 28.3)보다 damping이 커서 튕김 없이 즉각 붙는다 */
const FOLLOW = { stiffness: 1000, damping: 40, mass: 0.2 };

/** 카드 호버 시 확대/색 전환에 함께 쓰는 타이밍 */
const MORPH = { duration: 0.28, ease: "easeOut" } as const;

/**
 * 전역 커스텀 커서.
 * 포인터 좌표를 motion value로 받아 spring을 한 겹 씌워 따라오게 한다.
 * 기본 커서 숨김은 globals.css에서 처리 (마우스가 있는 환경에서만).
 *
 * 프로젝트 카드 이미지 호버 중에는 2배로 커지고, 검은 배경 위에 색이 순환하는 단색 레이어가 떠오른다.
 * 그 상태는 CardHoverProvider에서 받아 온다 — 헤드라인 blur/가속과 완전히 같은 소스다.
 */
export default function CustomCursor() {
  // 첫 이동 전까지는 화면 밖에 둔다
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const smoothX = useSpring(x, FOLLOW);
  const smoothY = useSpring(y, FOLLOW);

  /** 창 밖으로 나가면 false — 점이 그 자리에 남지 않고 페이드아웃된다 */
  const [visible, setVisible] = useState(false);

  const { hoveredId } = useCardHover();
  const onCard = hoveredId !== null;

  useEffect(() => {
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const hide = () => setVisible(false);
    const show = () => setVisible(true);

    window.addEventListener("pointermove", move, { passive: true });
    // 창 경계를 벗어날 때 발생 — document에 걸어야 창 밖으로 나가는 경우가 잡힌다
    document.addEventListener("mouseleave", hide);
    document.addEventListener("mouseenter", show);
    // 탭 전환 등으로 포커스를 잃는 경우도 동일하게 처리
    window.addEventListener("blur", hide);

    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("mouseleave", hide);
      document.removeEventListener("mouseenter", show);
      window.removeEventListener("blur", hide);
    };
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      // x/y는 framer가 transform으로 넣으므로, 중심 정렬은 transform 대신 음수 마진으로 한다
      // (scale도 같은 transform에 합쳐지고 원점이 중앙이라 커져도 좌표가 어긋나지 않는다)
      className="pointer-events-none fixed left-0 top-0 z-50 rounded-full bg-ink"
      style={{
        x: smoothX,
        y: smoothY,
        width: SIZE,
        height: SIZE,
        marginLeft: -SIZE / 2,
        marginTop: -SIZE / 2,
      }}
      animate={{ opacity: visible ? 1 : 0, scale: onCard ? 2 : 1 }}
      transition={{ opacity: { duration: 0.18, ease: "easeOut" }, scale: MORPH }}
    >
      {/* 색 순환 레이어를 검은 점 위에 얹고 opacity로 크로스페이드 (순환은 globals.css의 cursor-cycle) */}
      <motion.span
        className="cursor-cycle absolute inset-0 rounded-full"
        animate={{ opacity: onCard ? 1 : 0 }}
        transition={MORPH}
      />
    </motion.div>
  );
}
