import type { ReactNode } from "react";
import { SITE } from "@/lib/config";
import Headline from "@/components/Headline";

type Props = {
  children?: ReactNode;
  /** 프로젝트 카드 호버 중이면 헤드라인에 blur를 얹는다 */
  blurred?: boolean;
};

/**
 * 히어로 섹션 레이아웃.
 * 헤드라인은 여기서 렌더하고, 검색 입력 · 카테고리 버튼은 children으로 받는다.
 *
 * 헤드라인 / 입력창 / 카테고리 버튼의 가로 폭과 중심축을 맞추는 방식:
 * 셋을 `w-fit` 래퍼 하나에 묶으면 래퍼 폭이 "가장 넓은 자식의 고유 폭"으로 정해진다.
 * 아래쪽 행은 `w-0 min-w-full`이라 고유 폭 계산에는 0으로 잡히고(= 폭 결정에 관여하지 않고)
 * 실제 배치에서는 래퍼 폭 100%로 늘어난다. 따라서 래퍼 폭 = h1의 `max-w-[14ch]`가 되고,
 * 입력창과 버튼 행이 그 폭을 그대로 물려받는다.
 * 래퍼는 `items-center` 한 곳에서만 가운데 정렬되므로 세 요소의 중심축은 항상 동일하다.
 */
export default function Hero({ children, blurred = false }: Props) {
  // 그리드가 h-[52dvh]로 고정이라, 히어로는 남는 위쪽 공간을 flex-1로 전부 차지한다.
  // justify-center 덕분에 헤드라인~카테고리 버튼 그룹이 그 공간 안에서 상하 정확히 가운데에 놓인다.
  // (위아래 py-[2vh]는 화면이 아주 낮을 때 그룹이 가장자리에 붙지 않게 하는 최소 여백)
  return (
    <section className="mx-auto flex w-full min-h-0 max-w-6xl flex-1 flex-col items-center justify-center px-6 py-[2vh] text-center">
      <div className="flex w-fit max-w-full flex-col items-center">
        {/* blur · 1.5배 가속 · 컬러 마스크는 모두 Headline 안에서 처리된다 */}
        <Headline text={SITE.headline} blurred={blurred} />

        {/* mt = 헤드라인 → 입력창 간격, gap = 입력창 → 카테고리 버튼 간격 (둘 다 vh 기준).
            gap은 기존 4/5.3vh의 15%로 줄인 값. */}
        <div className="mt-[4.5vh] flex w-0 min-w-full flex-col items-center gap-[0.6vh] md:mt-[6.5vh] md:gap-[0.795vh]">
          {children}
        </div>
      </div>
    </section>
  );
}
