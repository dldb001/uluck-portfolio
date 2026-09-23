/**
 * 카테고리 버튼의 pill 모양 (예전엔 하단 이름 pill도 함께 썼다 — 지금은 좌상단 오브로 대체).
 *
 * 좌우 패딩은 일부러 여기 넣지 않는다(아래 PILL_PX 참고).
 * 같은 유틸리티(px-*)를 두 개 겹쳐 쓰면 어느 쪽이 이기는지가 클래스 문자열 순서가 아니라
 * 생성된 CSS의 출력 순서에 달려 있어서, 아예 한 곳에서 하나만 지정하게 갈라뒀다.
 */
export const PILL = "rounded-full border py-[0.45em] font-medium uppercase tracking-[0.04em]";

/** pill의 글자 크기 — 히어로 기준값에서 파생 (CategoryButtons는 행에서 한 번만 얹는다) */
export const PILL_TEXT = "text-[calc(var(--hero-fs)*0.225)]";

/** 카테고리 버튼의 좌우 패딩 */
export const PILL_PX = "px-[0.6em]";

/**
 * 상세 페이지 문단 — 히어로 아래 소개 요약과 이미지 그리드 사이 본문(ProjectGallery)이 같은 크기다.
 *
 * 글자 크기는 기준값(16px, md 18px)의 84% = 13.44px / md 15.12px. 원래 70%(11.2 / 12.6)였던
 * 것을 1.2배 키운 값이라 이렇게 떨어진다. 메타(라벨·값)는 여전히 70%다 (work/[id]/page.tsx).
 * 줄 간격은 배수(1.9)라 글자 크기를 따라 같이 움직인다.
 *
 * 두께는 font-semibold(600) — 한글은 Pretendard가 그리는데 이 크기에서는 400·500이 얇게
 * 보이고, 600은 layout.tsx에서 실제로 불러오는 웨이트라 브라우저가 합성하지 않는다.
 */
export const PROSE_TEXT =
  "text-pretty text-[13.44px]/[1.9] font-semibold text-ink/70 md:text-[15.12px]/[1.9]";

/**
 * 그리드 사이 본문 문단 — PROSE_TEXT에 줄바꿈 처리만 얹는다.
 *
 * whitespace-pre-line: 문단 텍스트 안의 개행("\n")을 그 자리의 줄바꿈으로 그린다.
 * 나머지 공백은 평소처럼 접히고, 긴 줄은 폭에 맞춰 여전히 자동으로 감긴다.
 * 소개 요약(description)은 개행을 쓰지 않으므로 PROSE_TEXT를 그대로 쓴다.
 */
export const BODY_TEXT = `whitespace-pre-line ${PROSE_TEXT}`;

/**
 * 문단의 폭 — 기준 폭만 max-w-3xl(48rem)인 것 말고는 이미지 그리드 폭(CONTENT_W)과 같은 식이다.
 *
 * 100%가 부모 폭이라, 어느 요소 안에 놓이느냐에 따라 결과가 달라진다. 소개 문단과 그리드
 * 사이 문단의 왼쪽 시작점이 같으려면 둘 다 같은 부모(CONTENT_W + px-3 컨테이너) 안에서
 * 이 폭을 계산해야 한다 — 소개 문단을 main 바로 아래에 두면 더 넓게 잡혀 왼쪽으로 튀어나온다.
 */
export const PROSE_W = "mx-auto w-[calc((100%_+_48rem)/2)] max-w-full";
