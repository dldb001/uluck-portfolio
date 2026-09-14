"use client";

import { SITE } from "@/lib/config";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

/**
 * 밑줄 스타일 검색 입력.
 * 값은 상위의 단일 `query` 상태와 동기화된다 (카테고리 버튼 · 그리드 필터 공용).
 */
export default function SearchInput({ value, onChange }: Props) {
  return (
    <form
      // TODO: 제출 동작 연결 (SPEC 5번 항목) — 현재는 시각 요소만
      onSubmit={(e) => e.preventDefault()}
      // 가로 폭은 Hero의 w-fit 래퍼가 정한다 (= 헤드라인 텍스트 폭). 여기서는 그 폭을 꽉 채우기만 한다.
      className="group relative w-full"
      role="search"
    >
      <label htmlFor="project-search" className="sr-only">
        프로젝트 검색
      </label>

      {/*
        글자 크기를 input이 아니라 이 행에 둔다 — input과 제출 버튼이 함께 상속받아야
        화살표 아이콘(아래 em 단위)이 글자와 같은 비율로 따라 줄어든다.

        min(rem, vh) 형태라 기존 크기가 상한이 된다. 창이 충분히 높으면 예전 값(0.567/0.756rem)
        그대로이고, 낮아질 때만 vh 쪽이 작아지며 헤드라인과 같이 줄어든다.
        (md 기준 0.756rem = 12.1px이므로 높이 약 550px 아래에서 vh 항이 이긴다)
      */}
      <div className="flex items-center gap-[0.378rem] border-b border-ink/25 pb-[min(0.378rem,1.1vh)] text-[min(0.567rem,1.7vh)]/[1.4] transition-colors focus-within:border-ink md:gap-[0.504rem] md:pb-[min(0.504rem,1.5vh)] md:text-[min(0.756rem,2.2vh)]/[1.4]">
        <input
          id="project-search"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={SITE.subtext}
          autoComplete="off"
          spellCheck={false}
          // 글자 크기는 위 행에서 상속받는다 (거기에 둬야 제출 버튼 아이콘과 함께 줄어든다)
          className="w-full bg-transparent font-medium tracking-tight text-ink outline-none placeholder:font-normal placeholder:text-ink/35"
        />

        <button
          type="submit"
          aria-label="검색"
          className="shrink-0 rounded-full p-[0.175rem] text-ink/60 transition-all hover:translate-x-0.5 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          <svg
            // 14px 고정이면 낮은 창에서 글자만 줄고 아이콘이 홀로 커 보인다.
            // 1.15em = md 기준 14px ÷ 12.1px — 예전 크기를 유지하면서 글자를 따라간다.
            className="h-[1.15em] w-[1.15em]"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </form>
  );
}
