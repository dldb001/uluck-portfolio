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
  /**
   * 한 행을 통째로 쓰고 원본 비율 그대로 보여준다 (rhythm 배치에서만 의미가 있다).
   * 파노라마 판정과 같은 블록으로 가므로 width/height가 있어야 한다 — 없으면 무시된다.
   * 여백이 넉넉한 목업처럼 16:9 틀에 넣어 위아래를 잘라내고 싶지 않은 이미지에 쓴다.
   */
  solo?: boolean;
}

/**
 * 본문 그리드 사이에 끼워 넣는 문단 (스타일은 lib/styles.ts의 BODY_TEXT).
 * 텍스트 안의 개행("\n")은 그 자리에서 줄바꿈된다 — 원하는 지점에서 줄을 나눌 때 쓴다.
 */
export interface GalleryText {
  text: string;
}

/**
 * 한 행에 나란히 놓을 이미지 묶음 — 배치를 자동 판정에 맡기지 않고 직접 지정할 때 쓴다.
 * (natural 배치에서만 의미가 있다 — rhythm·trio는 자기 규칙으로 묶으므로 낱장으로 풀린다)
 *
 * 칸 폭이 모두 같고 행 전체가 하나의 비율을 공유하므로 높이도 저절로 맞는다. 장수 제한은
 * 없다 — 2장이면 2열, 3장이면 3열이다. 행의 비율은 첫 장의 원본 비율(manifest)을 쓰고 각 칸은
 * object-cover로 채우므로, 같은 비율끼리 묶으면 아무 데도 잘리지 않고 다른 비율이 섞인
 * 경우에만 그 장의 가장자리가 잘린다.
 */
export interface GalleryRow {
  row: GalleryImage[];
}

/**
 * 본문 그리드의 항목 하나 — 이미지 · 문단 · 직접 지정한 행.
 * 문단은 이미지 흐름을 끊는 경계가 된다: 앞뒤 이미지들은 각각 따로 배치되고 그 사이에 글이 선다.
 */
export type GalleryItem = GalleryImage | GalleryText | GalleryRow;

export function isGalleryText(item: GalleryItem): item is GalleryText {
  return "text" in item;
}

export function isGalleryRow(item: GalleryItem): item is GalleryRow {
  return "row" in item;
}

/**
 * 상세 페이지 본문 그리드를 어떤 방식으로 배치할지.
 *
 * - rhythm(기본): 풀와이드 · 2열 · 비대칭 · 3열을 돌려 쓰며 강약을 준다 (ProjectGallery 참고)
 * - trio: 3장씩 한 세트로 같은 크기로만 배치한다. 한 프로젝트의 본문이 전부 같은 비율이고
 *   장수가 많을 때, 리듬을 주는 대신 규칙적으로 늘어놓는 편이 나은 경우에 쓴다.
 * - natural: 원본 비율 그대로 한 장씩 세로로 쌓는다. 위 둘은 정해진 틀에 object-cover로
 *   채워 넣어 가장자리가 잘리는데, 잘리면 안 되는 이미지(세로·정사각이 섞였거나 화면 전체가
 *   내용인 경우)를 위한 배치다. 자동 판정 대신 행을 직접 짜고 싶으면 GalleryRow를 섞어 쓴다.
 */
export type GalleryLayout = "rhythm" | "trio" | "natural";

export interface Project {
  id: string;
  title: string;
  /**
   * 상세 페이지 제목 아래 메타 — PDF 포트폴리오에서 옮겨 온 정보다(PROJECT_DETAILS.md 참고).
   *
   * 셋 다 선택 항목이다. PDF에 항목이 없는 프로젝트는 비워 두고,
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
  /** 상세 페이지 본문 이미지 그리드 — 사이에 문단을 끼울 수 있다 (없으면 thumbnail을 반복해 레이아웃만 잡는다) */
  gallery?: GalleryItem[];
  /** 본문 그리드 배치 방식 (없으면 "rhythm") */
  galleryLayout?: GalleryLayout;
  /** 여러 카테고리 중복 태깅 가능 */
  category: Category[];
  /** 상세 페이지 경로 (/work/[id]) */
  href: string;
}
