import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // 공용 클래스 문자열(lib/styles.ts)도 스캔 대상 — 빠지면 그 클래스가 CSS에 생성되지 않는다
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 배경값은 globals.css의 --background 한 곳에서 온다
        surface: "rgb(var(--background) / <alpha-value>)",
        ink: "#141414",
        muted: "#8A8781",
      },
      fontFamily: {
        /*
          Poppins → Pretendard → 시스템 순.

          한 벌로 합치지 않고 순서에 맡기는 이유: Poppins에는 한글 글리프가 없다.
          그래서 라틴·숫자·기호는 첫 번째인 Poppins가 그리고, 글리프가 없는 한글은
          브라우저가 자동으로 다음 폰트(Pretendard)로 넘긴다 — 글자 단위로 갈리므로
          한 문장에 영문과 한글이 섞여 있어도 각각 맞는 폰트로 그려진다.
          (그래서 순서를 바꾸면 영문까지 Pretendard가 가져간다 — 바꾸지 말 것)
        */
        sans: ["var(--font-sans)", "Pretendard", "system-ui", "sans-serif"],
      },
      fontSize: {
        // 실제 값은 globals.css의 --hero-fs (기준값 40px~100px의 90% → 80% → 70% = 20.16px ~ 50.4px).
        // 히어로의 폭 계산이 모두 이 글자 크기에서 파생되므로 한 곳에서만 정의한다.
        headline: ["var(--hero-fs)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
      },
    },
  },
  plugins: [],
};
export default config;
