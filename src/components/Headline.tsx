"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

/** 두 레이어가 완전히 겹치려면 타이포그래피 클래스가 글자 하나까지 동일해야 한다 */
const TYPO = "text-headline max-w-[14ch] font-medium text-balance";

/** 컬러 원이 포인터를 따라오는 속도 — 살짝 늦게 붙어야 "번지는" 느낌이 난다 */
const FOLLOW = { stiffness: 350, damping: 30, mass: 0.4 };

const FADE = { duration: 0.3, ease: "easeOut" } as const;

/* ── 호버 판정 영역 ──────────────────────────────────────────────
   글자 상자 밖으로 나가도 컬러가 켜지는 여유 범위를 아래 네 상수가 정한다.
   컬러 원의 크기(--spot-r)와는 무관하다 — 여기서 정하는 건 "감지 범위"뿐이고,
   원이 그려지는 반경은 globals.css의 기존 값을 그대로 쓴다.

   모양은 글자 상자 중심에 놓인 타원이다. 같은 넓이를 사각형으로 잡으면 헤드라인에서
   대각선으로 멀리 떨어진 네 모서리까지 반응해 범위가 엉뚱하게 느껴지는데, 타원은
   중심에서 멀어질수록 자연스럽게 좁아져 헤드라인으로 다가가는 움직임에만 반응한다.

   위·좌우는 빈 여백이라 넉넉하게 잡는다. 아래쪽만 바로 밑 검색 입력창과 겹칠 수
   있어 따로 다룬다 (PAD_BOTTOM_* 참고).                                        */

/**
 * 가로 반경 = 글자 상자 폭 × 이 값. 좌우를 합친 폭은 이 값의 2배가 된다 (1.9 → 3.8배).
 *
 * 세로 여유(PAD_TOP / PAD_BOTTOM_MAX)와 달리 px가 아니라 비율인 이유는, 헤드라인 폭이
 * --hero-fs에 묶여 뷰포트에 따라 변하기 때문이다. 비율로 두면 화면이 커져도 글자 대비
 * 여유가 같게 유지된다.
 */
const RX_RATIO = 1.9;

/** 위쪽 여유(px). 히어로의 빈 공간이라 겹칠 요소가 없어 크게 잡을 수 있다. */
const PAD_TOP = 160;

/**
 * 아래쪽 여유의 상한. 실제 값은 이보다 작아질 수 있다.
 *
 * 헤드라인 → 입력창 간격은 Hero의 mt-[4.5vh](md 이상 6.5vh)라 뷰포트 높이에 따라 변한다.
 * 화면 높이 1080px이면 49px지만 700px이면 32px까지 좁아지므로, px를 박아 두면 낮은 화면에서
 * 입력창을 침범한다. 그래서 매번 실제 간격을 재서 GUARD만 남기고 최대 이 값까지만 넓힌다.
 */
const PAD_BOTTOM_MAX = 32;

/** 입력창 위에서는 확실히 호버가 풀리도록 남겨 두는 최소 틈(px) */
const PAD_BOTTOM_GUARD = 8;

const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max);

type Props = {
  text: string;
  /** 프로젝트 카드 호버 중 — blur + 가속 + 마스크 해제(전체 컬러) */
  blurred?: boolean;
};

/**
 * 헤드라인. 그레이 레이어 위에 컬러 레이어를 겹쳐 두고, 위 레이어의 mask로 컬러가 보이는 범위를 정한다.
 *
 * - 텍스트 주변에 호버: 포인터 좌표(요소 기준 상대값)를 중심으로 한 radial-gradient 마스크가 따라다닌다.
 * - 카드 이미지 호버: 마스크를 걷어 전체가 컬러가 된다.
 * - 둘 다 아니면 위 레이어가 opacity 0이라 그레이만 남는다.
 *
 * 마스크 좌표는 spring을 거친 motion value라 포인터보다 살짝 늦게 따라온다.
 *
 * ── 호버 판정을 창 전역에서 하는 이유 ──
 * 감지 범위를 글자 상자보다 넓게 잡아야 하는데, 그만한 크기의 투명 요소를 겹치면
 * 바로 아래 검색 입력창(Hero의 mt-[4.5vh])을 덮어 클릭·포커스를 가로챈다.
 * 그래서 요소를 키우는 대신 창 전역 pointermove에서 좌표만 비교한다. 화면에는 아무것도 늘어나지
 * 않으므로 다른 요소의 클릭 판정에 전혀 영향을 주지 않는다. (CustomCursor와 같은 방식)
 */
export default function Headline({ text, blurred = false }: Props) {
  const [spotOn, setSpotOn] = useState(false);

  /** 마스크 좌표의 기준 상자 — 컬러 레이어가 이 요소의 inset-0이라 좌표계가 정확히 일치한다 */
  const boxRef = useRef<HTMLDivElement>(null);
  /** 리스너 안에서 직전 상태를 읽어야 "진입 순간"을 잡을 수 있다 (state는 클로저에 갇힌다) */
  const spotOnRef = useRef(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spotX = useSpring(x, FOLLOW);
  const spotY = useSpring(y, FOLLOW);

  // 중심은 완전히 불투명하고 가장자리로 갈수록 사라진다 — 경계가 딱 끊기지 않도록
  const mask = useMotionTemplate`radial-gradient(circle var(--spot-r) at ${spotX}px ${spotY}px, #000 0%, #000 40%, transparent 100%)`;

  const showColor = spotOn || blurred;

  useEffect(() => {
    const leave = () => {
      if (!spotOnRef.current) return;
      spotOnRef.current = false;
      setSpotOn(false);
    };

    const move = (e: PointerEvent) => {
      const box = boxRef.current;
      if (!box) return;
      const rect = box.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      // 글자 상자 중심에 놓인 타원. 위/아래 반경이 달라 반타원 두 개를 이어 붙인 모양이 된다.
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);

      // 바로 다음 형제가 검색 입력창 · 카테고리 버튼을 감싼 행이다 (Hero 참고).
      // 그 위에서는 헤드라인 호버가 풀려야 하므로, 남은 간격 안에서만 아래로 넓힌다.
      // 포인터가 위쪽 반원에 있으면 쓰이지 않으니, 매 프레임 레이아웃을 두 번 읽지 않도록
      // 필요할 때만 잰다.
      const padBottom = () => {
        const below = box.nextElementSibling?.getBoundingClientRect();
        const gap = below ? below.top - rect.bottom : Infinity;
        return Math.max(0, Math.min(PAD_BOTTOM_MAX, gap - PAD_BOTTOM_GUARD));
      };

      const rx = rect.width * RX_RATIO;
      const ry = rect.height / 2 + (dy < 0 ? PAD_TOP : padBottom());
      const inEllipse = (dx / rx) ** 2 + (dy / ry) ** 2 <= 1;

      // 글자 위는 언제나 반응해야 한다. 화면이 낮아 padBottom이 0에 가까워지면 타원의
      // 아래 반경이 상자 절반까지 줄어 아래쪽 두 모서리가 판정에서 빠지므로, 상자 자체를
      // 따로 더해 예전 동작을 보장한다.
      const inBox =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!inEllipse && !inBox) {
        leave();
        return;
      }

      // 여유 공간에 있으면 글자 상자 안쪽으로 당긴다 — 텍스트 위가 아니어도
      // 가장 가까운 지점에 원이 그려져 컬러가 반드시 보인다.
      const nx = clamp(e.clientX - rect.left, rect.width);
      const ny = clamp(e.clientY - rect.top, rect.height);
      x.set(nx);
      y.set(ny);

      if (!spotOnRef.current) {
        // 진입 지점으로 즉시 이동시킨다 — 안 그러면 직전 위치에서 쓸고 들어오는 게 보인다
        spotX.jump(nx);
        spotY.jump(ny);
        spotOnRef.current = true;
        setSpotOn(true);
      }
    };

    window.addEventListener("pointermove", move, { passive: true });
    // 창 밖으로 나가면 move가 더 오지 않으므로 여기서 꺼 준다 (CustomCursor와 동일)
    document.addEventListener("mouseleave", leave);
    window.addEventListener("blur", leave);

    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("mouseleave", leave);
      window.removeEventListener("blur", leave);
    };
  }, [x, y, spotX, spotY]);

  return (
    <div
      ref={boxRef}
      className={[
        "relative transition-[filter,opacity] duration-500 ease-out will-change-[filter]",
        blurred ? "headline-fast opacity-90 blur-[9px]" : "blur-0",
      ].join(" ")}
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
