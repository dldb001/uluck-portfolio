"use client";

import { MotionConfig, motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

/**
 * 스크롤해서 화면에 들어올 때 아래에서 살짝 올라오며 나타나는 상자 — 상세 페이지 본문 이미지용.
 *
 * 이동 거리(24px)와 시간(0.9초)은 "움직였다"보다 "스며들었다"에 가깝게 잡은 값이다.
 * once: 한 번 나타난 뒤에는 위로 되돌아가도 다시 숨지 않는다 — 다시 볼 때마다 깜빡이면 산만하다.
 * margin의 -10%: 화면 아래 끝에 걸치자마자가 아니라 조금 더 들어온 뒤에 시작해 움직임이 눈에 보이게 한다.
 *
 * 같은 행의 이미지는 delay로 조금씩 늦춰 왼쪽부터 차례로 올라오게 한다 (ProjectGallery 참고).
 * 운영체제에서 "동작 줄이기"를 켠 사용자에게는 MotionConfig가 이동을 빼고 페이드만 남긴다.
 *
 * ProjectGallery가 서버 컴포넌트라 motion을 직접 쓸 수 없어서 이 파일만 클라이언트로 뗐다.
 */
export default function Reveal({
  children,
  className,
  style,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        style={style}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
