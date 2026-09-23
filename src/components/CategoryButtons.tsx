"use client";

import type { Category } from "@/lib/types";
import { isCategoryActive } from "@/lib/filter";
import { PILL, PILL_PX, PILL_TEXT } from "@/lib/styles";

type Props = {
  categories: readonly Category[];
  /** 현재 query — 버튼 하이라이트의 단일 소스 */
  active: string;
  onSelect: (value: string) => void;
};

/**
 * 항상 노출되는 카테고리 버튼 (자동완성 겸용).
 * - 클릭: 입력창에 해당 텍스트 세팅 → 하이라이트 + 그리드 즉시 필터링
 * - 클릭한 버튼이 이미 active면 해제(빈 값 → 전체 노출)
 * - 타이핑 중: 매칭되는 버튼이 실시간 하이라이트
 *
 * 행 전체 폭은 `w-full` — Hero의 w-fit 래퍼가 정한 폭(= 헤드라인 텍스트 폭)을 입력창과 똑같이 물려받는다.
 * 각 버튼은 `flex-auto`(basis = 글자 폭)라 라벨 길이에 비례해 자리를 잡고 남는 폭을 나눠 채운다.
 *
 * 즉 "6개 버튼 가로 폭의 합 = 입력창 폭"은 자연 폭 합이 컨테이너를 넘지만 않으면 자동으로 성립한다.
 * (넘치면 `whitespace-nowrap` 때문에 더 줄지 못하고 오른쪽으로 삐져나온다 — 중심축이 어긋나는 원인.)
 *
 * 그 조건을 뷰포트와 무관하게 만들기 위해 글자/패딩/간격을 모두 `--hero-fs`에서 파생시킨다.
 * 컨테이너는 14ch ≈ 7.98 × --hero-fs 이고, 버튼 행의 자연 폭은
 *   글자 23.9em(6개 라벨 37자, tracking 0.04em 포함) + 좌우 패딩 7.2em + gap 2em ≈ 33.1em + 테두리 12px
 * 이라 글자 크기를 --hero-fs의 0.225배로 두면 33.1 × 0.225 ≈ 7.45 < 7.98 로 항상 안쪽에 들어온다.
 * 남는 약간의 여유는 `flex-auto`가 6개에 고르게 나눠 담아 행이 컨테이너를 정확히 채운다.
 */
export default function CategoryButtons({ categories, active, onSelect }: Props) {
  return (
    <div className={`flex w-full items-center gap-[0.4em] ${PILL_TEXT}`}>
      {categories.map((category) => {
        const isActive = isCategoryActive(category, active);
        return (
          <button
            key={category}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(isActive ? "" : category)}
            className={[
              // 글자 크기는 행에서 상속받고, 패딩은 em이라 함께 비례한다 (모양은 PILL)
              `flex-auto whitespace-nowrap transition-colors duration-200 ${PILL} ${PILL_PX}`,
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
              isActive
                ? "border-ink bg-ink text-surface"
                : "border-ink/20 bg-transparent text-ink/70 hover:border-ink/50 hover:text-ink",
            ].join(" ")}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
