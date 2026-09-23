"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCardHover } from "@/components/CardHoverProvider";

/** 평소 점의 지름(px) */
const DOT = 7;

/**
 * 포인터에 거의 동시에 붙는 spring.
 *
 * 반응 속도는 고유진동수 √(k/m)가 정한다 — 1800/0.2(≈95rad/s)에서 4500/0.1(≈212rad/s)로
 * 2배 넘게 올려 붙는 시간을 그만큼 줄였다. 임계감쇠는 2√(k·m) ≈ 42.4라 damping 36은
 * 감쇠비 0.85의 살짝 과소감쇠다. 오버슈트가 1px에도 못 미쳐 튕김은 보이지 않고, 임계값보다
 * 조금 낮게 둔 덕에 과감쇠처럼 마지막에 느릿하게 기어 들어가는 구간도 없다.
 */
const FOLLOW = { stiffness: 4500, damping: 36, mass: 0.1 };

/** 점 ↔ 렌즈 전환(크기 · 칠 · 윤곽)에 함께 쓰는 타이밍 */
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
 * 카드 위에서 커서가 커져 되는 유리 렌즈의 지름(px) — 커서 요소의 실제 크기이고, 굴절 계산 영역도 이 원 안으로 제한된다.
 * 아래 음수 마진이 이 값의 절반이라 좌표에 정확히 중심이 맞는다.
 */
const LENS = 56;

/** 렌즈 굴절 SVG 필터의 id — 아래 <svg>의 <filter>와 렌즈의 backdrop-filter: url(#…)이 함께 쓴다 */
const LENS_FILTER = "cursor-lens";

/**
 * 렌즈 뒤를 비추는 backdrop-filter.
 *
 * 굴절: backdrop-filter에 SVG 필터(url)를 거는 건 Chromium(Chrome · Edge · Whale 등)만 그린다.
 *   Safari · Firefox는 url()을 무시해 렌즈가 투명한 원만 남으므로, 그쪽은 살짝 흐리고 밝히는 유리로 대신한다.
 * 뒤의 saturate/brightness는 유리를 통과한 빛처럼 색이 조금 맑아 보이게 하는 몫.
 */
const REFRACT = `url(#${LENS_FILTER}) saturate(1.15) brightness(1.04)`;
const FROSTED = "blur(1.5px) saturate(1.15) brightness(1.04)";

/**
 * 점과 렌즈의 모습 — framer가 둘 사이를 MORPH로 보간한다.
 *
 * 점:   렌즈를 점 크기로 줄이고(DOT / LENS) ink(#141414)로 칠한다. 유리 윤곽은 투명.
 * 렌즈: 원래 크기, 칠은 투명, 유리 윤곽(가장자리 1px 하이라이트 · 위쪽 반사광 · 아래쪽 옅은 그늘 · 바깥 옅은 그림자).
 * 그림자 목록은 두 상태의 개수 · 순서가 같아야 보간되므로 점 쪽에도 같은 모양의 투명한 그림자를 둔다.
 */
const LOOK = {
  dot: {
    scale: DOT / LENS,
    backgroundColor: "rgba(20, 20, 20, 1)",
    boxShadow:
      "inset 0 0 0 1px rgba(255, 255, 255, 0), inset 0 2px 6px rgba(255, 255, 255, 0), inset 0 -4px 10px rgba(20, 20, 20, 0), 0 4px 14px rgba(20, 20, 20, 0)",
  },
  lens: {
    scale: 1,
    backgroundColor: "rgba(20, 20, 20, 0)",
    boxShadow:
      "inset 0 0 0 1px rgba(255, 255, 255, 0.45), inset 0 2px 6px rgba(255, 255, 255, 0.4), inset 0 -4px 10px rgba(20, 20, 20, 0.08), 0 4px 14px rgba(20, 20, 20, 0.08)",
  },
};

/**
 * 전역 커스텀 커서.
 * 포인터 좌표를 motion value로 받아 spring을 한 겹 씌워 따라오게 한다.
 * 기본 커서 숨김은 globals.css에서 처리 (마우스가 있는 환경에서만).
 *
 * 프로젝트 카드 이미지 호버 중에는 검은 점이 커지면서 유리 렌즈가 되어, 그 아래 이미지를 살짝 굴절시켜 보여준다.
 * 점과 렌즈는 한 요소라 화면의 커서는 늘 하나다.
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
  /** 카드를 벗어난 뒤에도 점으로 다 줄어들 때까지 굴절을 유지한다 (onAnimationComplete가 끈다) */
  const [lensKept, setLensKept] = useState(false);
  const glass = onCard || lensKept;

  /**
   * 서버와 첫 클라이언트 렌더는 false — 마운트 뒤 matchMedia로 판정한다.
   * 태블릿에 마우스를 꽂는 등 도중에 바뀌는 경우도 change 이벤트로 따라간다.
   */
  const [enabled, setEnabled] = useState(false);
  /** backdrop-filter에 SVG 필터를 그릴 수 있는 브라우저(Chromium)인지 — 아니면 렌즈는 흐린 유리로 대신한다 */
  const [refracts, setRefracts] = useState(false);

  useEffect(() => {
    setRefracts(/Chrome\//.test(navigator.userAgent));
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
    <>
      {/* 렌즈 굴절 필터 — 저주파 노이즈(feTurbulence)로 렌즈 안 픽셀을 몇 px씩 밀어(feDisplacementMap) 유리를
          지난 것처럼 살짝 일그러뜨린다. baseFrequency가 낮을수록 물결이 크고 느슨하고, scale이 밀어내는 최대 거리다.
          display: none이면 필터 참조가 끊기는 브라우저가 있어 크기 0으로 숨긴다. */}
      <svg aria-hidden width="0" height="0" className="pointer-events-none absolute">
        <filter id={LENS_FILTER} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* 커서 — 점과 유리 렌즈가 한 요소다. 실제 크기는 렌즈(LENS)이고, 평소에는 scale로 점 크기까지 줄이고
          검게 칠해 둔다. 카드 위에서는 원래 크기로 커지면서 검은 칠이 빠지고 유리 윤곽 · 굴절이 드러난다.
          x/y는 framer가 transform으로 넣으므로, 중심 정렬은 transform 대신 음수 마진으로 한다
          (scale도 같은 transform에 합쳐지고 원점이 중앙이라 커져도 좌표가 어긋나지 않는다). */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-50 rounded-full"
        style={{
          x: smoothX,
          y: smoothY,
          width: LENS,
          height: LENS,
          marginLeft: -LENS / 2,
          marginTop: -LENS / 2,
          // 굴절은 렌즈인 동안만 켠다 — 점일 때는 backdrop 계산 자체를 하지 않는다
          ...(glass && {
            backdropFilter: refracts ? REFRACT : FROSTED,
            WebkitBackdropFilter: refracts ? REFRACT : FROSTED,
          }),
        }}
        initial={false}
        animate={{
          opacity: visible ? 1 : 0,
          ...(onCard ? LOOK.lens : LOOK.dot),
        }}
        transition={{ opacity: { duration: 0.18, ease: "easeOut" }, default: MORPH }}
        // 렌즈가 다 커지면 굴절을 켠 채로 두고, 점으로 다 줄어든 뒤에야 끈다 — 줄어드는 도중에 굴절이 뚝 끊기지 않게
        onAnimationComplete={() => setLensKept(onCard)}
      />
    </>
  );
}
