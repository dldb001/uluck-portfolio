import type { GalleryImage, Project } from "@/lib/types";
import dellPageManifest from "../../public/images/projects/5_Dell_BG_S/2_page/optimized/manifest.json";
import dellColorPageManifest from "../../public/images/projects/4_Dell_BG_color/2_page/optimized/manifest.json";

const SAMSUNG_DIR = "/images/projects/1_Samsung Browser";

/** 2_page 원본과 1:1로 대응하는 번호 (1~14) */
const SAMSUNG_INDEXES = Array.from({ length: 14 }, (_, i) => i + 1);

/** 1_thumbnail 원본과 1:1로 대응하는 번호 (1~7) — 2_page와 장수가 다르다 */
const SAMSUNG_THUMB_INDEXES = Array.from({ length: 7 }, (_, i) => i + 1);

/**
 * 카드 썸네일 — 호버 중 순환시킬 프레임들.
 *
 * 원본은 1_thumbnail/*.png(900x1200, 3:4)이고 여기서 쓰는 건 그걸 JPG로 뽑은
 * optimized/ 쪽이다. 원본 PNG는 손대지 않는다 — 다시 뽑을 때의 기준이므로.
 * 카드가 최대 408px 폭(레티나 816px)으로 그려지는데 900px이라 축소 없이 그대로 쓴다.
 *
 * 첫 장 `hero.jpg`가 호버 전에 보이는 대표 이미지(= thumbnail)이고, 호버하면 1~7이 이어진다.
 *
 * 이름과 달리 `hero.jpg`는 상세 페이지 히어로(2_page/0_hero, 블롭 아트워크)와 다른 그림이다.
 * 상세 히어로와 같은 아트워크는 `1.jpg` 쪽이다. 카드 대표 이미지와 상세 히어로를 일부러
 * 다르게 두기로 한 것이므로, 둘이 어긋났다고 보고 맞추지 말 것.
 *
 * 폴더명에 공백이 있지만 next/image가 src를 인코딩하므로 여기서는 그대로 적는다
 * (미리 %20으로 적으면 이중 인코딩되어 깨진다).
 */
const SAMSUNG_THUMB_DIR = `${SAMSUNG_DIR}/1_thumbnail/optimized`;

const samsungBrowserFrames = [
  `${SAMSUNG_THUMB_DIR}/hero.jpg`,
  ...SAMSUNG_THUMB_INDEXES.map((n) => `${SAMSUNG_THUMB_DIR}/${n}.jpg`),
];

/**
 * 상세 페이지 본문 이미지 그리드.
 * 전부 2304x1296(16:9)이라 파노라마 판정이 걸릴 일이 없어 크기는 넘기지 않는다
 * (다음에 이 폴더를 다시 뽑으면 manifest.json이 생기므로 DELL처럼 옮겨 오면 된다).
 */
const samsungBrowserGallery: GalleryImage[] = SAMSUNG_INDEXES.map((n) => ({
  src: `${SAMSUNG_DIR}/2_page/optimized/${n}.jpg`,
}));

const DELL_DIR = "/images/projects/5_Dell_BG_S";

/**
 * DELL — 구성 규칙은 Samsung 쪽과 같다. `hero`가 대표 이미지 / 히어로이고 나머지가 순환·본문.
 *
 * 파일 번호가 1부터 이어지지 않아서(썸네일 2·3·4, 본문 2~6) 범위로 만들지 않고 그대로 적는다.
 * 원본 PNG는 손대지 않고 optimized/ 쪽만 쓴다:
 *   1_thumbnail  900x1200(3:4) q95 — 카드 최대 408px, 레티나 816px보다 크므로 축소 없이 그대로
 *   2_page       원본 해상도 q92   — 2675x750(3.57:1)과 1557x750(2.08:1)이 섞여 있다
 *
 * 본문 이미지는 크기를 함께 넘긴다. 둘 다 2:1을 넘는 파노라마라 ProjectGallery가 이 값을 보고
 * 좌우가 잘리지 않는 전용 블록으로 배치한다. 값은 manifest.json에서 오므로 이미지를 다시
 * 뽑으면 자동으로 따라 바뀐다 — 여기에 숫자를 직접 적지 말 것.
 */
const dellFrames = ["hero", "2", "3", "4"].map(
  (n) => `${DELL_DIR}/1_thumbnail/optimized/${n}.jpg`,
);

const dellGallery: GalleryImage[] = ["2", "3", "4", "5", "6"].map((n) => ({
  src: `${DELL_DIR}/2_page/optimized/${n}.jpg`,
  ...dellPageManifest[`${n}.jpg` as keyof typeof dellPageManifest],
}));

const DELL_COLOR_DIR = "/images/projects/4_Dell_BG_color";

/**
 * DELL 2026 — 구성 규칙은 위 두 프로젝트와 같다. `hero`가 대표 이미지 / 히어로이고 나머지가 순환·본문.
 *
 * 원본 PNG는 손대지 않고 optimized/ 쪽만 쓴다:
 *   1_thumbnail  900x1200(3:4) q95 — 카드 최대 408px(레티나 816px)보다 크므로 축소 없이 그대로
 *   2_page       q92 — 본문은 1920px 폭, 파노라마 2장(hero·1)만 원본 폭 그대로
 *
 * 파노라마만 줄이지 않은 건 그 둘이 화면 폭을 꽉 채워 그려지기 때문이다 (히어로는 100vw,
 * 본문 파노라마는 컨테이너 전체 폭). 1920px으로 맞추면 레티나에서 눈에 띄게 흐려진다.
 *
 * 본문 이미지는 크기를 함께 넘긴다. 3.56:1인 1.jpg를 ProjectGallery가 파노라마로 가려내
 * 좌우가 잘리지 않는 전용 블록에 배치한다. 값은 manifest.json에서 오므로 이미지를 다시
 * 뽑으면 자동으로 따라 바뀐다 — 여기에 숫자를 직접 적지 말 것.
 */
const dellColorFrames = ["hero", "1", "2", "3", "4"].map(
  (n) => `${DELL_COLOR_DIR}/1_thumbnail/optimized/${n}.jpg`,
);

/** 2_page에는 6번이 없어 번호가 1~5, 7로 이어진다 — 범위로 만들지 않고 그대로 적는다 */
const dellColorGallery: GalleryImage[] = ["1", "2", "3", "4", "5", "7"].map((n) => ({
  src: `${DELL_COLOR_DIR}/2_page/optimized/${n}.jpg`,
  ...dellColorPageManifest[`${n}.jpg` as keyof typeof dellColorPageManifest],
}));

const NAVER_DIR = "/images/projects/3_Naver_Fall series ICON";

/**
 * NAVER — 아직 썸네일(1_thumbnail)만 있고 2_page가 없다.
 *
 * 그래서 hero / gallery 필드를 아예 두지 않는다. 상세 페이지가 hero는 thumbnail로 대체하고
 * gallery는 thumbnail 반복으로 자리만 잡아 주므로(work/[id]/page.tsx 참고) 임시 화면이 된다.
 * 2_page가 준비되면 DELL처럼 optimized/ + manifest를 만들어 두 필드를 채우면 된다.
 *
 * 폴더명에 공백이 있지만 next/image가 src를 인코딩하므로 그대로 적는다.
 */
const naverFrames = ["hero", "1", "2", "3"].map(
  (n) => `${NAVER_DIR}/1_thumbnail/optimized/${n}.jpg`,
);

/**
 * TODO: 프로젝트별 실제 소개 문단으로 교체.
 * 지금은 12개가 같은 문구를 참조하지만 필드는 각자 갖고 있어 하나씩 바꿔 나가면 된다.
 */
const TODO_DESCRIPTION =
  "TODO: 이 프로젝트의 배경과 역할, 사용한 도구와 결과를 한 단락으로 소개합니다. " +
  "무엇을 만들었고 어떤 문제를 풀었는지, 작업에서 무엇을 맡았는지를 적어 주세요.";

/**
 * 더미 프로젝트 데이터.
 * TODO: 실제 프로젝트 콘텐츠(이미지·제목·카테고리 태깅)로 교체 (SPEC 5번 항목)
 */
export const projects: Project[] = [
  {
    id: "chromatic-systems",
    title: "Samsung Browser BG",
    description: TODO_DESCRIPTION,
    thumbnail: samsungBrowserFrames[0],
    thumbnails: samsungBrowserFrames,
    hero: `${SAMSUNG_DIR}/2_page/optimized/0_hero.jpg`,
    gallery: samsungBrowserGallery,
    category: ["UI", "ARTWORKS"],
    href: "/work/chromatic-systems",  },
  {
    id: "naver-fall-series-icon",
    title: "Naver Fall series ICON",
    description: TODO_DESCRIPTION,
    thumbnail: naverFrames[0],
    thumbnails: naverFrames,
    // hero / gallery 없음 — 2_page가 준비되기 전까지 상세 페이지는 썸네일로 자리만 잡는다
    category: ["UI", "3D"],
    href: "/work/naver-fall-series-icon",  },
  {
    id: "dell-2026-bg",
    title: "DELL 2026 BG",
    description: TODO_DESCRIPTION,
    thumbnail: dellColorFrames[0],
    thumbnails: dellColorFrames,
    hero: `${DELL_COLOR_DIR}/2_page/optimized/hero.jpg`,
    gallery: dellColorGallery,
    category: ["ARTWORKS", "3D"],
    href: "/work/dell-2026-bg",  },
  {
    id: "dell-s-bg",
    title: "DELL S series BG",
    description: TODO_DESCRIPTION,
    thumbnail: dellFrames[0],
    thumbnails: dellFrames,
    hero: `${DELL_DIR}/2_page/optimized/hero.jpg`,
    gallery: dellGallery,
    category: ["ARTWORKS", "3D"],
    href: "/work/dell-s-bg",  },
  {
    id: "volume-study",
    title: "Volume Study",
    description: TODO_DESCRIPTION,
    thumbnail: "/images/projects/volume-study.svg",
    category: ["3D"],
    href: "/work/volume-study",  },
  {
    id: "paper-signals",
    title: "Paper Signals",
    description: TODO_DESCRIPTION,
    thumbnail: "/images/projects/paper-signals.svg",
    category: ["2D", "ARTWORKS"],
    href: "/work/paper-signals",  },
  {
    id: "kinetic-identity",
    title: "Kinetic Identity",
    description: TODO_DESCRIPTION,
    thumbnail: "/images/projects/kinetic-identity.svg",
    category: ["MOTIONGRAPHIC"],
    href: "/work/kinetic-identity",  },
  {
    id: "room-404",
    title: "Room 404",
    description: TODO_DESCRIPTION,
    thumbnail: "/images/projects/room-404.svg",
    category: ["MEDIA ART", "3D"],
    href: "/work/room-404",  },
  {
    id: "ledger",
    title: "Ledger",
    description: TODO_DESCRIPTION,
    thumbnail: "/images/projects/ledger.svg",
    category: ["UI"],
    href: "/work/ledger",  },
  {
    id: "soft-machines",
    title: "Soft Machines",
    description: TODO_DESCRIPTION,
    thumbnail: "/images/projects/soft-machines.svg",
    category: ["3D", "MOTIONGRAPHIC"],
    href: "/work/soft-machines",  },
  {
    id: "fieldnotes",
    title: "Fieldnotes",
    description: TODO_DESCRIPTION,
    thumbnail: "/images/projects/fieldnotes.svg",
    category: ["2D"],
    href: "/work/fieldnotes",  },
  {
    id: "signal-garden",
    title: "Signal Garden",
    description: TODO_DESCRIPTION,
    thumbnail: "/images/projects/signal-garden.svg",
    category: ["MEDIA ART", "ARTWORKS"],
    href: "/work/signal-garden",  },
  {
    id: "orbit-os",
    title: "Orbit OS",
    description: TODO_DESCRIPTION,
    thumbnail: "/images/projects/orbit-os.svg",
    category: ["UI", "3D"],
    href: "/work/orbit-os",  },
  {
    id: "ink-drift",
    title: "Ink Drift",
    description: TODO_DESCRIPTION,
    thumbnail: "/images/projects/ink-drift.svg",
    category: ["ARTWORKS", "2D"],
    href: "/work/ink-drift",  },
  {
    id: "nightshift",
    title: "Nightshift",
    description: TODO_DESCRIPTION,
    thumbnail: "/images/projects/nightshift.svg",
    category: ["MOTIONGRAPHIC", "MEDIA ART"],
    href: "/work/nightshift",  },
];
