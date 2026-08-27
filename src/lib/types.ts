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

export interface Project {
  id: string;
  title: string;
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
  /** 여러 카테고리 중복 태깅 가능 */
  category: Category[];
  /** 상세 페이지 경로 (/work/[id]) */
  href: string;
}
