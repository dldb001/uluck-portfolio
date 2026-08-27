/**
 * 카테고리 버튼과 푸터 이름표가 공유하는 pill 모양.
 *
 * 좌우 패딩은 일부러 여기 넣지 않는다 — 두 곳의 값이 서로 다르기 때문(아래 PILL_PX 참고).
 * 같은 유틸리티(px-*)를 두 개 겹쳐 쓰면 어느 쪽이 이기는지가 클래스 문자열 순서가 아니라
 * 생성된 CSS의 출력 순서에 달려 있어서, 아예 한 곳에서 하나만 지정하게 갈라뒀다.
 */
export const PILL = "rounded-full border py-[0.45em] font-medium uppercase tracking-[0.04em]";

/** pill의 글자 크기 — 히어로 기준값에서 파생 (CategoryButtons는 행에서 한 번만 얹는다) */
export const PILL_TEXT = "text-[calc(var(--hero-fs)*0.225)]";

/** 카테고리 버튼의 좌우 패딩. 푸터 이름표는 이 값의 1.5배(0.9em)를 따로 쓴다. */
export const PILL_PX = "px-[0.6em]";
