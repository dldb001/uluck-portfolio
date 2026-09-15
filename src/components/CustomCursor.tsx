"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCardHover } from "@/components/CardHoverProvider";

/** 원 지름(px) — 아래 음수 마진이 이 값의 절반이라 좌표에 정확히 중심이 맞는다 */
const SIZE = 7;

/**
 * 포인터에 거의 동시에 붙는 spring.
 *
 * 반응 속도는 고유진동수 √(k/m)가 정한다 — 1800/0.2(≈95rad/s)에서 4500/0.1(≈212rad/s)로
 * 2배 넘게 올려 붙는 시간을 그만큼 줄였다. 임계감쇠는 2√(k·m) ≈ 42.4라 damping 36은
 * 감쇠비 0.85의 살짝 과소감쇠다. 오버슈트가 1px에도 못 미쳐 튕김은 보이지 않고, 임계값보다
 * 조금 낮게 둔 덕에 과감쇠처럼 마지막에 느릿하게 기어 들어가는 구간도 없다.
 */
const FOLLOW = { stiffness: 4500, damping: 36, mass: 0.1 };

/** 카드 호버 시 확대/색 전환에 함께 쓰는 타이밍 */
const MORPH = { duration: 0.28, ease: "easeOut" } as const;

/**
 * 커스텀 커서를 쓸 환경 — globals.css가 기본 커서를 숨기는 조건과 같은 쿼리다.
 * 둘이 같아야 "기본 커서는 숨겼는데 점은 없는" 또는 그 반대 상태가 생기지 않는다.
 *
 * 터치 기기는 pointer: coarse라 여기에 걸리지 않는다. 터치도 pointermove를 발생시키므로
 * 이 판별 없이는 손가락을 뗀 자리에 점이 켜진 채 남는다 (mouseleave가 오지 않는다).
 */
const POINTER_QUERY = "(hover: hover) and (pointer: fine)";

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
  /** 리스너 안에서 직전 상태를 읽어 전환 순간에만 setState 한다 (Headline과 같은 방식) */
  const visibleRef = useRef(false);

  const { hoveredId } = useCardHover();
  const onCard = hoveredId !== null;

  /**
   * 서버와 첫 클라이언트 렌더는 false — 마운트 뒤 matchMedia로 판정한다.
   * 태블릿에 마우스를 꽂는 등 도중에 바뀌는 경우도 change 이벤트로 따라간다.
   */
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(POINTER_QUERY);
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    // 터치 기기에서는 점을 그리지 않으므로 좌표를 받을 이유도 없다
    if (!enabled) return;

    // 좌표는 motion value라 리렌더 없이 갱신된다. visible까지 매 프레임 set 하면
    // 포인터가 움직이는 내내 이 컴포넌트가 다시 그려지므로, 값이 바뀔 때만 넘긴다.
    const setShown = (next: boolean) => {
      if (visibleRef.current === next) return;
      visibleRef.current = next;
      setVisible(next);
    };

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setShown(true);
    };
    const hide = () => setShown(false);
    const show = () => setShown(true);

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
  }, [enabled, x, y]);

  if (!enabled) return null;

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
