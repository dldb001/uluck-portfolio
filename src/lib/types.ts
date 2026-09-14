export const CATEGORIES = [
  "UI",
  "MOTIONGRAPHIC",
  "3D",
  "2D",
  "ARTWORKS",
  "MEDIA ART",
] as const;

export type Category = (typeof CATEGORIES)[number];

/**
 * 상세 페이지 본문 그리드에 들어가는 이미지 한 장.
 *
 * width/height는 optimized 폴더의 manifest.json에서 온다 (optimize-images.mjs가 함께 남긴다).
 * 비율을 알아야 파노라마를 가려내 잘리지 않는 전용 블록으로 보낼 수 있다.
 * 없으면 비율을 모르는 것으로 보고 기존 블록 리듬으로만 배치한다.
 */
export interface GalleryImage {
  src: string;
  width?: number;
  height?: number;
}

/**
 * 상세 페이지 본문 그리드를 어떤 방식으로 배치할지.
 *
 * - rhythm(기본): 풀와이드 · 2열 · 비대칭 · 3열을 돌려 쓰며 강약을 준다 (ProjectGallery 참고)
 * - trio: 3장씩 한 세트로 같은 크기로만 배치한다. 한 프로젝트의 본문이 전부 같은 비율이고
 *   장수가 많을 때, 리듬을 주는 대신 규칙적으로 늘어놓는 편이 나은 경우에 쓴다.
 * - natural: 원본 비율 그대로 한 장씩 세로로 쌓는다. 위 둘은 정해진 틀에 object-cover로
 *   채워 넣어 가장자리가 잘리는데, 잘리면 안 되는 이미지(세로·정사각이 섞였거나 화면 전체가
 *   내용인 경우)를 위한 배치다.
 */
export type GalleryLayout = "rhythm" | "trio" | "natural";

export interface Project {
  id: string;
  title: string;
  /**
   * 상세 페이지 제목 아래 메타 — PDF 포트폴리오에서 옮겨 온 정보다(PROJECT_DETAILS.md 참고).
   *
   * 셋 다 선택 항목이다. 매칭이 확정되지 않은 프로젝트와 더미 프로젝트는 비워 두고,
   * 상세 페이지는 값이 있는 항목만 줄을 만든다 (work/[id]/page.tsx 참고).
   */
  /** 클라이언트 — "삼성전자", "HYBE" */
  client?: string;
  /** 작업 기간 — "2025.10 – 2025.12" */
  date?: string;
  /** 참여 인원과 맡은 작업 — "4인 · 기획, 스타일프레임 디자인" */
  contribution?: string;
  /** public/images 경로 or 외부 URL — 호버하지 않은 평소 상태에 보이는 대표 이미지 */
  thumbnail: string;
  /**
   * 호버 중 순서대로 순환시킬 이미지들 (첫 장 포함).
   * 없거나 1장 이하면 `thumbnail` 한 장으로 고정된다.
   */
  thumbnails?: string[];
  /** 상세 페이지 소개 문단 */
  description: string;
  /** 상세 페이지 풀블리드 히어로 이미지 (없으면 thumbnail로 대체) */
  hero?: string;
  /** 상세 페이지 본문 이미지 그리드 (없으면 thumbnail을 반복해 레이아웃만 잡는다) */
  gallery?: GalleryImage[];
  /** 본문 그리드 배치 방식 (없으면 "rhythm") */
  galleryLayout?: GalleryLayout;
  /** 여러 카테고리 중복 태깅 가능 */
  category: Category[];
  /** 상세 페이지 경로 (/work/[id]) */
  href: string;
}
