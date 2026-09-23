"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { PROFILE, SITE } from "@/lib/config";

/**
 * 원 ↔ 둥근 사각형 변형에 쓰는 곡선과 시간 — ease-out quart. 넘치는 구간 없이 끝에서 천천히 멈춘다.
 *
 * 주의: framer는 transform 값(scale · x · y)에 ease를 주지 않으면 기본으로 spring을 쓰고,
 * duration만 주면 "그 시간 안에 끝나는 spring"이 되어 끝에서 살짝 넘쳤다가 돌아온다 ("툭" 튀는 느낌).
 * 그래서 이 파일의 모든 transition은 ease를 명시해 tween으로 고정한다.
 */
const EASE = [0.25, 1, 0.5, 1] as const;
const MORPH = { duration: 0.6, ease: EASE } as const;

/**
 * 펼친 카드의 그림자 — 가까운 그림자(윤곽) + 넓고 옅은 그림자 두 겹.
 * 접힌 원의 그림자는 globals.css의 .orb-disc가 따로 그린다.
 */
const DROP = "0 1px 3px rgba(20, 20, 20, 0.02), 0 8px 24px -8px rgba(20, 20, 20, 0.03)";
/** DROP과 개수 · 순서가 같은 투명 그림자 — framer가 둘 사이를 보간하려면 목록 모양이 같아야 한다 */
const NO_DROP = "0 1px 3px rgba(20, 20, 20, 0), 0 8px 24px -8px rgba(20, 20, 20, 0)";

/**
 * 카드 자체의 표면 — framer가 두 상태 사이를 보간한다.
 *
 * 접힌 원: 표면은 비워 둔다. 보이는 원(배경색 원판 + 도는 그라디언트 링)은 카드 바깥의 .orb 레이어가
 *   맡는다 (globals.css).
 * 펼친 카드: 흰색 27.5% + backdrop-blur 18px + 1px 흰색 50% 테두리. 뒤의 페이지가 비치는 평평한 유리.
 *
 * 크기(layout) · 모서리 · 배경 · 그림자 · blur가 모두 MORPH 하나(0.6s, 같은 곡선)로 함께 움직인다.
 * 접힌 원의 레이어가 사라지는 것과 호버 확대가 돌아오는 것도 globals.css에서 같은 값으로 맞췄다.
 *
 * 테두리는 border 대신 inset 그림자로 준다 — layout 애니메이션 중 요소가 scale로 늘어날 때 border는
 * 같이 두꺼워지지만 box-shadow는 framer가 보정한다. 그림자 목록은 두 상태의 개수 · 순서가 같아야
 * 보간되므로 접힌 쪽에도 투명한 테두리 자리를 둔다.
 */
const SURFACE = {
  closed: {
    backgroundColor: "rgba(255, 255, 255, 0)",
    boxShadow: `inset 0 0 0 1px rgba(255, 255, 255, 0), ${NO_DROP}`,
    backdropFilter: "blur(0px)",
  },
  open: {
    backgroundColor: "rgba(255, 255, 255, 0.275)",
    boxShadow: `inset 0 0 0 1px rgba(255, 255, 255, 0.5), ${DROP}`,
    // 클래스로 켜고 끄면 blur가 0 → 18px로 한순간에 뛴다 — 여기 두어 크기 · 배경 · 그림자와 같은 곡선으로 보간한다
    backdropFilter: "blur(18px)",
  },
};

/** 이름 줄과 경력 줄이 함께 쓰는 글자 — 한 가지 크기 · 줄 간격으로 통일한다 */
const TEXT = "text-[13px] leading-[1.55]";

/**
 * 화면 좌상단의 유리 오브 — 누르면 둥근 사각형 카드로 늘어나며 이력과 연락처를 보여준다.
 *
 * 구조:
 *   원 (.orb)          둘레를 도는 그라디언트 링(자리마다 흐림이 다르고 그 분포가 돈다) + 그 위를 덮는 흰 원판.
 *                     펼치면 사라진다.
 *   카드 (motion.div)  접히면 투명한 클릭 영역, 펼치면 유리 둥근 사각형(SURFACE). 크기는 framer의 layout 애니메이션이,
 *                     배경색 · 그림자 · 모서리는 animate가 같은 곡선으로 함께 보간한다.
 *   버튼              카드 전체를 덮는 투명 버튼. 어디를 눌러도 열고/닫힌다.
 *   내용              버튼 위에 뜨지만 pointer-events-none이라 클릭은 버튼으로 흘러간다 (링크만 예외).
 *
 * 여백: 위·왼쪽은 오브 지름(--orb)만큼 (페이지 아래쪽 2배 여백은 app/page.tsx).
 *
 * 열고 닫는 순서 — 변형 도중에 글자가 찌그러져 보이지 않도록 둘을 겹치지 않게 한다:
 *   열기  카드가 먼저 늘어나고, 거의 다 늘어난 뒤에 내용이 나타난다 (내용의 delay)
 *   닫기  내용이 먼저 사라지고(open = false), 사라진 뒤에야 카드가 원으로 줄어든다 (expanded = false)
 */
export default function ProfileOrb() {
  /** 내용이 보이는지 */
  const [open, setOpen] = useState(false);
  /** 카드가 펼쳐진 모양인지 — 닫을 때는 내용이 다 사라진 다음에 false가 된다 */
  const [expanded, setExpanded] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const show = () => {
    setExpanded(true);
    setOpen(true);
  };
  const hide = () => setOpen(false);

  // 바깥 클릭 / Esc 로 닫기 (열려 있을 때만 리스너를 건다)
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    // "동작 줄이기" 사용자에게는 변형·이동 없이 바로 바뀐다
    <MotionConfig reducedMotion="user">
      {/* z-40: 페이지 위, 커스텀 커서(z-50) 아래 */}
      <div ref={wrapRef} className="group fixed left-[var(--orb)] top-[var(--orb)] z-40">
        {/* 접힌 원 — 둘레를 도는 그라디언트 링 + 그 위를 덮는 흰 원판 (globals.css .orb-*). 원 자리에 고정된 오브 크기라
            펼치면 사라지고 카드 표면(SURFACE.open)이 이어받는다. 원판의 그림자가 카드(overflow-hidden) 밖으로
            퍼져야 하므로 카드 바깥, 카드보다 먼저 그린다.
            호버 확대도 여기서 CSS로 준다 — 보이는 건 이 레이어고, 카드는 접힌 동안 투명한 클릭 영역일 뿐이다. */}
        <span
          aria-hidden
          className={`orb pointer-events-none absolute left-0 top-0 size-[var(--orb)] ${
            expanded ? "orb--hidden" : "group-hover:scale-[1.06]"
          }`}
        >
          {/* 흐림 정도만 다른 링 세 벌 — 각도 mask로 나눠 맡고, 그 분포 전체(.orb-glow)가 돈다 */}
          <span className="orb-glow">
            {([1, 2, 3] as const).map((n) => (
              <span key={n} className={`orb-glow-layer orb-glow-layer--${n}`}>
                <span className={`orb-blur orb-blur--${n}`}>
                  <span className="orb-ring" />
                </span>
              </span>
            ))}
          </span>
          {/* 안쪽 원판 — 링 위를 불투명하게 덮어, 링의 색 · 흐림이 안쪽으로 번져 들어오지 못하게 한다 */}
          <span className="orb-disc" />
        </span>

        <motion.div
          layout
          initial={false}
          animate={{ borderRadius: expanded ? 18 : 28, ...(expanded ? SURFACE.open : SURFACE.closed) }}
          transition={MORPH}
          className={`relative overflow-hidden ${
            expanded ? "w-[min(20rem,calc(100vw_-_var(--orb)*2))]" : "size-[var(--orb)]"
          }`}
        >
          <button
            type="button"
            onClick={open ? hide : show}
            aria-expanded={open}
            aria-controls="profile-panel"
            aria-label={open ? "프로필 닫기" : "프로필 · 연락처 열기"}
            className="absolute inset-0 rounded-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ink/30"
          />

          <AnimatePresence onExitComplete={() => setExpanded(false)}>
            {open && (
              <motion.div
                id="profile-panel"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.32, duration: 0.45, ease: EASE } }}
                exit={{ opacity: 0, transition: { duration: 0.15, ease: "easeOut" } }}
                data-lenis-prevent
                className={`pointer-events-none relative max-h-[calc(100dvh_-_var(--orb)*3)] overflow-y-auto px-6 py-[22px] font-medium text-ink ${TEXT}`}
              >
                {/* 이름 / 직함 — 붙여서 두 줄 */}
                <p className="font-semibold">{SITE.author}</p>
                <p>{PROFILE.role}</p>

                {/* 경력 — 회사 이름은 고정 폭 첫 열, 기간은 둘째 열에서 왼쪽 정렬로 세로줄을 맞춘다 */}
                <ul className="mt-5">
                  {PROFILE.career.map(({ company, period }) => (
                    <li key={company} className="grid grid-cols-[5.5rem_1fr]">
                      <span>{company}</span>
                      <span className="tabular-nums">{period}</span>
                    </li>
                  ))}
                </ul>

                {/* 연락처 */}
                <div className="mt-5 flex gap-4">
                  {PROFILE.contact.map(({ label, href, external }) => (
                    <a
                      key={label}
                      href={href}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="pointer-events-auto text-ink/45 underline decoration-ink/20 underline-offset-[0.3em] transition-colors duration-200 hover:text-ink/75 hover:decoration-ink/50"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
