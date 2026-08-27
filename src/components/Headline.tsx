"use client";

import { useState, type PointerEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

/** 두 레이어가 완전히 겹치려면 타이포그래피 클래스가 글자 하나까지 동일해야 한다 */
const TYPO = "text-headline max-w-[14ch] font-medium text-balance";

/** 컬러 원이 포인터를 따라오는 속도 — 살짝 늦게 붙어야 "번지는" 느낌이 난다 */
const FOLLOW = { stiffness: 350, damping: 30, mass: 0.4 };

const FADE = { duration: 0.3, ease: "easeOut" } as const;

type Props = {
  text: string;
  /** 프로젝트 카드 호버 중 — blur + 가속 + 마스크 해제(전체 컬러) */
  blurred?: boolean;
};

/**
 * 헤드라인. 그레이 레이어 위에 컬러 레이어를 겹쳐 두고, 위 레이어의 mask로 컬러가 보이는 범위를 정한다.
 *
 * - 텍스트에 직접 호버: 포인터 좌표(요소 기준 상대값)를 중심으로 한 radial-gradient 마스크가 따라다닌다.
 * - 카드 이미지 호버: 마스크를 걷어 전체가 컬러가 된다.
 * - 둘 다 아니면 위 레이어가 opacity 0이라 그레이만 남는다.
 *
 * 마스크 좌표는 spring을 거친 motion value라 포인터보다 살짝 늦게 따라온다.
 */
export default function Headline({ text, blurred = false }: Props) {
  const [spotOn, setSpotOn] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spotX = useSpring(x, FOLLOW);
  const spotY = useSpring(y, FOLLOW);

  // 중심은 완전히 불투명하고 가장자리로 갈수록 사라진다 — 경계가 딱 끊기지 않도록
  const mask = useMotionTemplate`radial-gradient(circle var(--spot-r) at ${spotX}px ${spotY}px, #000 0%, #000 40%, transparent 100%)`;

  const showColor = spotOn || blurred;

  const track = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  const handleEnter = (e: PointerEvent<HTMLDivElement>) => {
    track(e);
    // 진입 지점으로 즉시 이동시킨다 — 안 그러면 직전 위치에서 쓸고 들어오는 게 보인다
    spotX.jump(x.get());
    spotY.jump(y.get());
    setSpotOn(true);
  };

  return (
    <div
      className={[
        "relative transition-[filter,opacity] duration-500 ease-out will-change-[filter]",
        blurred ? "headline-fast opacity-90 blur-[9px]" : "blur-0",
      ].join(" ")}
      onPointerEnter={handleEnter}
      onPointerMove={track}
      onPointerLeave={() => setSpotOn(false)}
    >
      <h1 className={`headline-layer headline-layer--gray ${TYPO}`}>{text}</h1>

      {/* 아래 h1과 같은 글자를 겹쳐 그린다 — 스크린리더에는 중복이므로 숨긴다 */}
      <motion.span
        aria-hidden
        className={`headline-layer headline-layer--color ${TYPO} pointer-events-none absolute inset-0`}
        // 카드 호버 중에는 마스크를 걷어 전체가 컬러로 보이게 한다
        style={
          blurred
            ? { WebkitMaskImage: "none", maskImage: "none" }
            : { WebkitMaskImage: mask, maskImage: mask }
        }
        animate={{ opacity: showColor ? 1 : 0 }}
        transition={FADE}
      >
        {text}
      </motion.span>
    </div>
  );
}
