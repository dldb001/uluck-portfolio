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

      <div className="flex items-center gap-[0.378rem] border-b border-ink/25 pb-[0.378rem] transition-colors focus-within:border-ink md:gap-[0.504rem] md:pb-[0.504rem]">
        <input
          id="project-search"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={SITE.subtext}
          autoComplete="off"
          spellCheck={false}
          className="w-full bg-transparent text-[0.567rem]/[1.4] font-medium tracking-tight text-ink outline-none placeholder:font-normal placeholder:text-ink/35 md:text-[0.756rem]/[1.4]"
        />

        <button
          type="submit"
          aria-label="검색"
          className="shrink-0 rounded-full p-[0.175rem] text-ink/60 transition-all hover:translate-x-0.5 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          <svg
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
