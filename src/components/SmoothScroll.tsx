"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis 기반 부드러운 세로 스크롤.
 * 가로 드래그(프로젝트 그리드)는 Framer Motion이 담당하므로 Lenis는 세로만 처리한다.
 */
export default function SmoothScroll() {
  useEffect(() => {
    // 접근성: 모션 최소화 설정 시 스무스 스크롤을 걸지 않는다.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
