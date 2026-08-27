"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SITE } from "@/lib/config";
import { PILL, PILL_TEXT } from "@/lib/styles";

const LINKS = [
  { label: "Mail", href: "mailto:dldbtjr001@gmail.com", external: false },
  { label: "Instagram", href: "https://www.instagram.com/u_lucks/", external: true },
] as const;

/**
 * 페이지 맨 아래 이름 표기 + 연락처 토글.
 *
 * 비주얼은 카테고리 버튼과 같은 pill — 라운드 · 상하 패딩 · 글자 크기를 `PILL` / `PILL_TEXT`로 공유한다.
 * 좌우 패딩만 버튼(PILL_PX = 0.6em)의 1.5배인 0.9em을 쓴다.
 *
 * 링크는 pill 오른쪽에 absolute로 띄운다 — 문서 흐름에 끼면 pill이 중앙에서 밀리기 때문에,
 * 열고 닫아도 pill의 가로 중심은 그대로 유지된다.
 */
export default function Footer() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

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
    <footer className="flex w-full shrink-0 justify-center px-6 pb-5 pt-4 md:pb-6">
      <div ref={wrapRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="footer-links"
          className={`${PILL} ${PILL_TEXT} border-ink/20 px-[0.9em] text-ink/70 transition-colors duration-200 hover:border-ink/50 hover:text-ink`}
        >
          {SITE.author}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              id="footer-links"
              // y는 세로 중앙 정렬용 — framer가 transform을 쓰므로 -translate-y-1/2 대신 여기서 함께 준다
              initial={{ opacity: 0, x: -6, y: "-50%" }}
              animate={{ opacity: 1, x: 0, y: "-50%" }}
              exit={{ opacity: 0, x: -6, y: "-50%" }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={`${PILL_TEXT} absolute left-full top-1/2 ml-[1.2em] flex items-center gap-[1.2em] whitespace-nowrap`}
            >
              {LINKS.map(({ label, href, external }) => (
                <a
                  key={label}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="text-ink/60 underline decoration-ink/25 underline-offset-[0.35em] transition-colors duration-200 hover:text-ink hover:decoration-ink/60"
                >
                  {label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </footer>
  );
}
