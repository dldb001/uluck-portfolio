import type { GalleryImage, Project } from "@/lib/types";
import dellPageManifest from "../../public/images/projects/5_Dell_BG_S/2_page/optimized/manifest.json";
import dellColorPageManifest from "../../public/images/projects/4_Dell_BG_color/2_page/optimized/manifest.json";
import luckyPageManifest from "../../public/images/projects/7_Lucky Spectrum/2_page/optimized/manifest.json";
import gardenPageManifest from "../../public/images/projects/8_Lucky Garden/2_page/optimized/manifest.json";
import lottePageManifest from "../../public/images/projects/9_LOTTE Dept. Nowon VP Film/2_page/optimized/manifest.json";
import lgPageManifest from "../../public/images/projects/10_LG Brand Expressions/2_page/optimized/manifest.json";
import xmasPageManifest from "../../public/images/projects/11_Lucky Christmas Lounge/2_page/optimized/manifest.json";
import ibkPageManifest from "../../public/images/projects/12_IBK memorial hall/2_page/optimized/manifest.json";
import kbsPageManifest from "../../public/images/projects/14_KBS NEWS OAP/2_page/optimized/manifest.json";
import colloquiumPageManifest from "../../public/images/projects/15_Naver Colloquium 2022/2_page/optimized/manifest.json";
import btsPageManifest from "../../public/images/projects/16_BTS Official Light Stick/2_page/optimized/manifest.json";
import walletPageManifest from "../../public/images/projects/17_Samsung Wallet/2_page/optimized/manifest.json";
import mamaPageManifest from "../../public/images/projects/18_CJ MAMA 2024/2_page/optimized/manifest.json";
import livsmedPageManifest from "../../public/images/projects/19_LIVSMED/2_page/optimized/manifest.json";

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

const GALAXY_WATCH_DIR = "/images/projects/2_Galaxy watch ICON";

/**
 * Galaxy Watch ICON — NAVER · Samsung ST와 같은 상태다. 썸네일만 있고 2_page가 아직 없어
 * hero / gallery 필드를 두지 않는다. 상세 페이지가 hero는 thumbnail로 대체하고 gallery는
 * thumbnail 반복으로 자리만 잡아 주므로(work/[id]/page.tsx 참고) 임시 화면이 된다.
 * 2_page가 준비되면 DELL처럼 optimized/ + manifest를 만들어 두 필드를 채우면 된다.
 *
 * 원본은 1_thumbnail/*.png이고 여기서 쓰는 건 optimized/ 쪽이다:
 *   1~5     1875x2500(3:4) → 900x1200 q95
 *   hero    원본이 이미 900x1200이라 크기 변화 없이 JPG로만 바뀐다
 * 카드 최대 408px(레티나 816px)보다 크므로 축소 없이 그대로 쓴다.
 *
 * 폴더 루트의 hero.psd는 일러스트 원본이라 최적화 대상에서 빠진다(스크립트가 png/jpg 계열만 읽는다).
 *
 * 폴더명에 공백이 있지만 next/image가 src를 인코딩하므로 그대로 적는다.
 */
const galaxyWatchFrames = ["hero", "1", "2", "3", "4", "5"].map(
  (n) => `${GALAXY_WATCH_DIR}/1_thumbnail/optimized/${n}.jpg`,
);

const SAMSUNG_ST_DIR = "/images/projects/6_Samsung_ST";

/**
 * Samsung ST — NAVER와 같은 상태다. 썸네일만 있고 2_page가 아직 없어 hero / gallery 필드를 두지 않는다.
 * 상세 페이지가 hero는 thumbnail로 대체하고 gallery는 thumbnail 반복으로 자리만 잡아 주므로
 * (work/[id]/page.tsx 참고) 임시 화면이 된다. 2_page가 준비되면 DELL처럼 optimized/ + manifest를
 * 만들어 두 필드를 채우면 된다.
 *
 * 원본은 1875x2500 PNG(정확히 3:4)이고 여기서 쓰는 건 optimized/ 쪽이다:
 *   1_Thumbnail  900x1200(3:4) q95 — 카드 최대 408px(레티나 816px)보다 크므로 축소 없이 그대로
 *
 * 주의: 폴더명이 `1_Thumbnail`로, 다른 프로젝트의 `1_thumbnail`과 T의 대소문자가 다르다.
 * Windows는 구분하지 않지만 배포되는 Linux는 구분하므로 폴더명을 바꾸면 여기도 같이 고쳐야 한다.
 */
const samsungStFrames = ["hero", "1", "2", "3", "4"].map(
  (n) => `${SAMSUNG_ST_DIR}/1_Thumbnail/optimized/${n}.jpg`,
);

const LUCKY_DIR = "/images/projects/7_Lucky Spectrum";

/**
 * Lucky Spectrum — 썸네일과 2_page가 모두 있어 DELL과 같은 구성이다.
 * `hero`가 카드 대표 이미지 / 상세 히어로이고 나머지가 순환·본문이다.
 *
 * 원본은 손대지 않고 optimized/ 쪽만 쓴다:
 *   1_thumbnail  원본이 이미 900x1200(3:4)이라 크기 변화 없이 q95 JPG로만 바뀐다
 *                (카드 최대 408px, 레티나 816px보다 크므로 축소 없이 그대로)
 *   2_page       q92 — 본문은 1920px 폭, 파노라마 3장(hero·1·2)만 원본 폭 3840 그대로
 *
 * 파노라마만 줄이지 않은 건 DELL 2026과 같은 이유다. 히어로는 100vw, 본문 파노라마는
 * 컨테이너 전체 폭으로 그려져 1920px으로 맞추면 레티나에서 눈에 띄게 흐려진다.
 *
 * 본문 이미지는 크기를 함께 넘긴다. 3.06:1인 1·2가 파노라마로 가려져 좌우가 잘리지 않는
 * 전용 블록에 배치된다. 값은 manifest.json에서 오므로 이미지를 다시 뽑으면 자동으로
 * 따라 바뀐다 — 여기에 숫자를 직접 적지 말 것.
 *
 * 폴더명에 공백이 있지만 next/image가 src를 인코딩하므로 그대로 적는다.
 */
const luckyFrames = ["hero", "1", "2", "3", "4"].map(
  (n) => `${LUCKY_DIR}/1_thumbnail/optimized/${n}.jpg`,
);

/** 2_page는 hero를 뺀 1~6이 본문이다 */
const luckyGallery: GalleryImage[] = ["1", "2", "3", "4", "5", "6"].map((n) => ({
  src: `${LUCKY_DIR}/2_page/optimized/${n}.jpg`,
  ...luckyPageManifest[`${n}.jpg` as keyof typeof luckyPageManifest],
}));

const GARDEN_DIR = "/images/projects/8_Lucky Garden";

/**
 * Lucky Garden — 썸네일과 2_page가 모두 있어 Lucky Spectrum과 같은 구성이다.
 * `hero`가 카드 대표 이미지 / 상세 히어로이고 나머지가 순환·본문이다.
 *
 * 원본은 손대지 않고 optimized/ 쪽만 쓴다:
 *   1_Thumbnail  원본이 이미 900x1200(3:4)이라 크기 변화 없이 q95 JPG로만 바뀐다
 *   2_page       q92 — 16:9인 10~13만 1920px 폭, 파노라마(hero·1~9)는 최대 3840px
 *
 * 파노라마 폭을 3840에서 끊은 건 원본이 6244px까지 있어서다. 파노라마는 화면 폭을 꽉 채워
 * 그려지지만 1920px 화면의 레티나도 3840px이면 충분하고, 그 위로는 파일만 무거워진다.
 * (3·4·6이 6244 → 3840으로 줄고 나머지는 원본 그대로다)
 *
 * 본문 이미지는 크기를 함께 넘긴다. 3.05:1인 1~9가 파노라마로 가려져 좌우가 잘리지 않는
 * 전용 블록에 배치된다. 값은 manifest.json에서 오므로 이미지를 다시 뽑으면 자동으로
 * 따라 바뀐다 — 여기에 숫자를 직접 적지 말 것.
 *
 * 주의: 폴더명이 `1_Thumbnail`로, 다른 프로젝트의 `1_thumbnail`과 T의 대소문자가 다르다.
 * Windows는 구분하지 않지만 배포되는 Linux는 구분하므로 폴더명을 바꾸면 여기도 같이 고쳐야 한다.
 * (Samsung ST와 같은 경우다)
 */
const gardenFrames = ["hero", "1", "2", "3", "4"].map(
  (n) => `${GARDEN_DIR}/1_Thumbnail/optimized/${n}.jpg`,
);

/** 2_page는 hero를 뺀 1~13이 본문이다 */
const gardenGallery: GalleryImage[] = Array.from({ length: 13 }, (_, i) => `${i + 1}`).map((n) => ({
  src: `${GARDEN_DIR}/2_page/optimized/${n}.jpg`,
  ...gardenPageManifest[`${n}.jpg` as keyof typeof gardenPageManifest],
}));

const LOTTE_DIR = "/images/projects/9_LOTTE Dept. Nowon VP Film";

/**
 * LOTTE Dept. Nowon VP Film — 썸네일과 2_page가 모두 있다.
 *
 * 구성 규칙은 DELL·Lucky 쪽과 같다. `hero`가 카드 대표 이미지 / 상세 히어로이고
 * 나머지가 순환·본문이다. 썸네일과 상세 히어로가 서로 다른 그림이다.
 *
 * 원본은 손대지 않고 optimized/ 쪽만 쓴다:
 *   1_thumbnail  원본이 이미 900x1200(3:4)이라 크기 변화 없이 q95 JPG로만 바뀐다
 *   2_page       q92 — 본문(1~16)은 1920px 폭, 히어로만 원본 폭 3860 그대로
 *
 * 히어로만 줄이지 않은 건 3.63:1 파노라마가 100vw로 그려지기 때문이다. 본문 쪽은
 * 1.25:1과 16:9뿐이라 파노라마 판정(2:1 이상)에 걸리는 장이 없고, 전부 기본 블록 리듬을 탄다.
 * 크기는 manifest.json에서 오므로 이미지를 다시 뽑으면 자동으로 따라 바뀐다.
 */
const LOTTE_THUMB_DIR = `${LOTTE_DIR}/1_thumbnail/optimized`;

const lotteFrames = ["hero", "1", "2", "3"].map((n) => `${LOTTE_THUMB_DIR}/${n}.jpg`);

/** 2_page는 hero를 뺀 1~16이 본문이다 */
const lotteGallery: GalleryImage[] = Array.from({ length: 16 }, (_, i) => `${i + 1}`).map((n) => ({
  src: `${LOTTE_DIR}/2_page/optimized/${n}.jpg`,
  ...lottePageManifest[`${n}.jpg` as keyof typeof lottePageManifest],
}));

const LG_DIR = "/images/projects/10_LG Brand Expressions";

/**
 * LG Brand Expressions — 구성은 LOTTE 쪽과 같다.
 * `hero`가 카드 대표 이미지 / 상세 히어로이고 나머지가 순환·본문이다.
 *
 * 원본은 손대지 않고 optimized/ 쪽만 쓴다:
 *   1_thumbnail  원본이 이미 900x1200(3:4)이라 크기 변화 없이 q95 JPG로만 바뀐다
 *   2_page       q92 — 본문(1~15)은 전부 1920x1080이라 폭 그대로, 히어로만 원본 폭 3646
 *
 * 히어로만 따로 뽑은 건 3.38:1 파노라마가 100vw로 그려지기 때문이다. 본문은 16:9뿐이라
 * 파노라마 판정(2:1 이상)에 걸리는 장이 없고 전부 기본 블록 리듬을 탄다.
 * 크기는 manifest.json에서 오므로 이미지를 다시 뽑으면 자동으로 따라 바뀐다.
 */
const lgFrames = ["hero", "1", "2", "3", "4"].map(
  (n) => `${LG_DIR}/1_thumbnail/optimized/${n}.jpg`,
);

/** 2_page는 hero를 뺀 1~15가 본문이다 */
const lgGallery: GalleryImage[] = Array.from({ length: 15 }, (_, i) => `${i + 1}`).map((n) => ({
  src: `${LG_DIR}/2_page/optimized/${n}.jpg`,
  ...lgPageManifest[`${n}.jpg` as keyof typeof lgPageManifest],
}));

const XMAS_DIR = "/images/projects/11_Lucky Christmas Lounge";

/**
 * Lucky Christmas Lounge — 구성은 Lucky Garden과 같다.
 * `hero`가 카드 대표 이미지 / 상세 히어로이고 나머지가 순환·본문이다.
 *
 * 원본은 손대지 않고 optimized/ 쪽만 쓴다:
 *   1_thumbnail  원본이 이미 900x1200(3:4)이라 크기 변화 없이 q95 JPG로만 바뀐다
 *   2_page       q92 — 파노라마(hero·1~4)는 6244 → 3840으로, 4:3인 5만 1920px 폭
 *
 * 파노라마를 3840에서 끊는 기준은 Lucky Garden과 같다. 화면 폭을 꽉 채워 그려지지만
 * 1920px 화면의 레티나도 3840이면 충분하고, 그 위로는 파일만 무거워진다.
 *
 * 본문 이미지는 크기를 함께 넘긴다. 3.05:1인 1~4가 파노라마로 가려져 좌우가 잘리지 않는
 * 전용 블록에 배치되고, 4:3인 5만 기본 블록에 들어간다.
 * 값은 manifest.json에서 오므로 이미지를 다시 뽑으면 자동으로 따라 바뀐다.
 */
const xmasFrames = ["hero", "1", "2", "3"].map(
  (n) => `${XMAS_DIR}/1_thumbnail/optimized/${n}.jpg`,
);

/** 2_page는 hero를 뺀 1~5가 본문이다 */
const xmasGallery: GalleryImage[] = Array.from({ length: 5 }, (_, i) => `${i + 1}`).map((n) => ({
  src: `${XMAS_DIR}/2_page/optimized/${n}.jpg`,
  ...xmasPageManifest[`${n}.jpg` as keyof typeof xmasPageManifest],
}));

const IBK_DIR = "/images/projects/12_IBK memorial hall";

/**
 * IBK memorial hall — `hero`가 카드 대표 이미지 / 상세 히어로이고 나머지가 순환·본문이다.
 *
 * 원본은 손대지 않고 optimized/ 쪽만 쓴다:
 *   1_thumbnail  원본이 이미 900x1200(3:4)이라 크기 변화 없이 q95 JPG로만 바뀐다
 *   2_page       q92 — 히어로만 원본 폭 3360, 본문은 최대 1920px
 *
 * 본문 1~9는 원본이 1344x1728(0.78:1 세로)이라 1920 상한에 걸리지 않고 그대로 나온다.
 * 세로와 가로가 섞인 유일한 프로젝트라 galleryLayout을 "natural"로 두었다 — 기본 배치의
 * 가로 틀에 넣으면 세로 이미지의 위아래가 잘린다.
 *
 * 크기는 manifest.json에서 오므로 이미지를 다시 뽑으면 자동으로 따라 바뀐다.
 */
const ibkFrames = ["hero", "1", "2", "3", "4"].map(
  (n) => `${IBK_DIR}/1_thumbnail/optimized/${n}.jpg`,
);

/** 2_page는 hero를 뺀 1~10이 본문이다 */
const ibkGallery: GalleryImage[] = Array.from({ length: 10 }, (_, i) => `${i + 1}`).map((n) => ({
  src: `${IBK_DIR}/2_page/optimized/${n}.jpg`,
  ...ibkPageManifest[`${n}.jpg` as keyof typeof ibkPageManifest],
}));

const GS_DIR = "/images/projects/13_GS_Homeshopping";

/**
 * GS Homeshopping — 2_page에 이미지가 한 장뿐이라 그 한 장을 상세 히어로로 쓴다.
 *
 * 원본은 손대지 않고 optimized/ 쪽만 쓴다:
 *   1_thumbnail  원본이 이미 900x1200(3:4)이라 크기 변화 없이 q95 JPG로만 바뀐다
 *                (카드 최대 408px, 레티나 816px보다 크므로 축소 없이 그대로)
 *   2_page       q92 — 2304x1296(16:9) 한 장뿐이라 100vw 히어로용으로 원본 폭 그대로 둔다
 *
 * 그래서 gallery 필드는 두지 않는다. 본문에 깔 장이 남지 않아서다 — 상세 페이지가 썸네일을
 * 반복해 자리만 잡아 주므로(work/[id]/page.tsx 참고) 본문은 임시 화면이다.
 * 2_page에 본문 이미지가 더 들어오면 KBS처럼 optimized/ + manifest로 gallery를 채우면 된다.
 */
const gsFrames = ["hero", "1", "2"].map((n) => `${GS_DIR}/1_thumbnail/optimized/${n}.jpg`);

const KBS_DIR = "/images/projects/14_KBS NEWS OAP";

/**
 * KBS NEWS OAP — 구성은 LG Brand Expressions와 같다.
 * 카드 대표 이미지는 1_thumbnail/hero, 상세 히어로는 2_page/hero이고 나머지가 순환·본문이다.
 *
 * 원본은 손대지 않고 optimized/ 쪽만 쓴다:
 *   1_thumbnail  원본이 이미 900x1200(3:4)이라 크기 변화 없이 q95 JPG로만 바뀐다
 *   2_page       q92 — 본문(1~20)은 전부 1920x1080이라 폭 그대로, 히어로만 원본 폭 3840
 *
 * 히어로만 따로 뽑은 건 3.06:1 파노라마가 100vw로 그려지기 때문이다. 본문은 16:9뿐이라
 * 파노라마 판정(2:1 이상)에 걸리는 장이 없다.
 * 크기는 manifest.json에서 오므로 이미지를 다시 뽑으면 자동으로 따라 바뀐다.
 */
const kbsFrames = ["hero", "1", "2", "3", "4"].map(
  (n) => `${KBS_DIR}/1_thumbnail/optimized/${n}.jpg`,
);

/** 2_page는 hero를 뺀 1~20이 본문이다 */
const kbsGallery: GalleryImage[] = Array.from({ length: 20 }, (_, i) => `${i + 1}`).map((n) => ({
  src: `${KBS_DIR}/2_page/optimized/${n}.jpg`,
  ...kbsPageManifest[`${n}.jpg` as keyof typeof kbsPageManifest],
}));

const COLLOQUIUM_DIR = "/images/projects/15_Naver Colloquium 2022";

/**
 * Naver Colloquium 2022 — 구성은 KBS 쪽과 같지만 본문이 전부 세로다.
 *
 * 원본은 손대지 않고 optimized/ 쪽만 쓴다:
 *   1_thumbnail  원본이 이미 900x1200(3:4)이라 크기 변화 없이 q95 JPG로만 바뀐다
 *   2_page       q92 — 본문(1~10)은 원본이 1200x2000(0.6:1)이라 1920 상한에 걸리지 않고 그대로,
 *                 히어로만 원본 폭 3840 (3.06:1 파노라마가 100vw로 그려진다)
 *
 * 크기는 manifest.json에서 오므로 이미지를 다시 뽑으면 자동으로 따라 바뀐다.
 */
const colloquiumFrames = ["hero", "1", "2", "3"].map(
  (n) => `${COLLOQUIUM_DIR}/1_thumbnail/optimized/${n}.jpg`,
);

/** 2_page는 hero를 뺀 1~10이 본문이다 */
const colloquiumGallery: GalleryImage[] = Array.from({ length: 10 }, (_, i) => `${i + 1}`).map(
  (n) => ({
    src: `${COLLOQUIUM_DIR}/2_page/optimized/${n}.jpg`,
    ...colloquiumPageManifest[`${n}.jpg` as keyof typeof colloquiumPageManifest],
  }),
);

/**
 * 16~19번은 네 프로젝트가 같은 모양이다 — 썸네일은 900x1200(3:4), 상세는 2_page/hero 파노라마 +
 * 16:9 본문. 구성 규칙은 KBS NEWS OAP와 같다.
 *
 * 원본은 손대지 않고 optimized/ 쪽만 쓴다:
 *   1_thumbnail  원본이 이미 900x1200(3:4)이라 크기 변화 없이 q95 JPG로만 바뀐다
 *                (카드 최대 408px, 레티나 816px보다 크므로 축소 없이 그대로)
 *   2_page       q92 — 본문은 1920px 상한, 히어로만 원본 폭 3840
 *
 * 히어로만 따로 뽑은 건 3.06:1 파노라마가 100vw로 그려지기 때문이다. 본문은 16:9뿐이라
 * 파노라마 판정(2:1 이상)에 걸리는 장이 없고, 그래서 네 프로젝트 모두 galleryLayout이 "trio"다
 * (전부 같은 비율이고 장수가 많을 때는 강약을 주는 기본 배치보다 규칙적인 편이 낫다).
 *
 * 크기는 manifest.json에서 오므로 이미지를 다시 뽑으면 자동으로 따라 바뀐다.
 */
const BTS_DIR = "/images/projects/16_BTS Official Light Stick";

const btsFrames = ["hero", "1", "2", "3"].map(
  (n) => `${BTS_DIR}/1_thumbnail/optimized/${n}.jpg`,
);

/** 2_page는 hero를 뺀 1~9가 본문이다. 원본이 1400x788이라 1920 상한에 걸리지 않고 그대로 나온다 */
const btsGallery: GalleryImage[] = Array.from({ length: 9 }, (_, i) => `${i + 1}`).map((n) => ({
  src: `${BTS_DIR}/2_page/optimized/${n}.jpg`,
  ...btsPageManifest[`${n}.jpg` as keyof typeof btsPageManifest],
}));

const WALLET_DIR = "/images/projects/17_Samsung Wallet";

const walletFrames = ["hero", "1", "2"].map(
  (n) => `${WALLET_DIR}/1_thumbnail/optimized/${n}.jpg`,
);

/** 2_page는 hero를 뺀 1~12가 본문이다. 원본 3840x2160이 1920으로 줄어든다 */
const walletGallery: GalleryImage[] = Array.from({ length: 12 }, (_, i) => `${i + 1}`).map((n) => ({
  src: `${WALLET_DIR}/2_page/optimized/${n}.jpg`,
  ...walletPageManifest[`${n}.jpg` as keyof typeof walletPageManifest],
}));

const MAMA_DIR = "/images/projects/18_CJ MAMA 2024";

const mamaFrames = ["hero", "1", "2", "3"].map(
  (n) => `${MAMA_DIR}/1_thumbnail/optimized/${n}.jpg`,
);

/** 2_page는 hero를 뺀 1~9가 본문이다 */
const mamaGallery: GalleryImage[] = Array.from({ length: 9 }, (_, i) => `${i + 1}`).map((n) => ({
  src: `${MAMA_DIR}/2_page/optimized/${n}.jpg`,
  ...mamaPageManifest[`${n}.jpg` as keyof typeof mamaPageManifest],
}));

const LIVSMED_DIR = "/images/projects/19_LIVSMED";

const livsmedFrames = ["hero", "1", "2", "3", "4"].map(
  (n) => `${LIVSMED_DIR}/1_thumbnail/optimized/${n}.jpg`,
);

/**
 * 2_page는 hero를 뺀 나머지가 본문인데 번호가 1~11로 이어지지 않는다 —
 * 8이 8-1~8-5로 쪼개져 있고 9는 없다. 범위로 만들지 않고 파일명 그대로 적는다.
 */
const livsmedGallery: GalleryImage[] = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8-1",
  "8-2",
  "8-3",
  "8-4",
  "8-5",
  "10",
  "11",
].map((n) => ({
  src: `${LIVSMED_DIR}/2_page/optimized/${n}.jpg`,
  ...livsmedPageManifest[`${n}.jpg` as keyof typeof livsmedPageManifest],
}));

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
    client: "SAMSUNG",
    date: "2025.04 – 2026.05",
    contribution: "1인 · 스타일프레임 디자인",
    description:
      "삼성 브라우저에서 화면을 드래그하거나 기기가 바뀌어도 시각적 흐름이 끊기지 않도록 롱폼으로 디자인한 배경 아트워크입니다.",
    thumbnail: samsungBrowserFrames[0],
    thumbnails: samsungBrowserFrames,
    hero: `${SAMSUNG_DIR}/2_page/optimized/0_hero.jpg`,
    gallery: samsungBrowserGallery,
    category: ["UI", "ARTWORKS"],
    href: "/work/chromatic-systems",  },
  {
    id: "naver-fall-series-icon",
    title: "Naver Fall series ICON",
    client: "네이버",
    date: "2023.09 – 2023.11",
    contribution: "2인 · 기획, 아이콘 디자인",
    description:
      "네이버 서비스 안에서 포인트로 쓰이는 아이콘들을, 가을의 계절감을 담아서 디자인했습니다.",
    thumbnail: naverFrames[0],
    thumbnails: naverFrames,
    // hero / gallery 없음 — 2_page가 준비되기 전까지 상세 페이지는 썸네일로 자리만 잡는다
    category: ["UI", "3D"],
    href: "/work/naver-fall-series-icon",  },
  {
    id: "samsung-st",
    title: "Samsung SmartThings ICON",
    client: "삼성전자",
    date: "2024.09 – 2024.11",
    contribution: "4인 · 기획, 아이콘 디자인, 애니메이션",
    description:
      "삼성 스마트싱스 앱 환경에서 한눈에 읽히도록, 명확한 아웃라인과 삼성 블루를 포인트 컬러로 아이콘과 OOBE 세트를 디자인했습니다.",
    thumbnail: samsungStFrames[0],
    thumbnails: samsungStFrames,
    // hero / gallery 없음 — 2_page가 준비되기 전까지 상세 페이지는 썸네일로 자리만 잡는다
    category: ["UI", "3D"],
    href: "/work/samsung-st",  },
  {
    id: "galaxy-watch-icon",
    title: "Galaxy Watch ICON",
    client: "삼성전자",
    date: "2024.07 – 2024.09",
    contribution: "2인 · 기획, 아이콘 디자인, 애니메이션",
    description:
      "손목 위 작은 스크린이라는 조건에 맞춰, 갤럭시 워치를 위한 헬스 기능 아이콘 세트를 디자인했습니다.",
    thumbnail: galaxyWatchFrames[0],
    thumbnails: galaxyWatchFrames,
    // hero / gallery 없음 — 2_page가 준비되기 전까지 상세 페이지는 썸네일로 자리만 잡는다
    category: ["UI", "3D"],
    href: "/work/galaxy-watch-icon",  },
  {
    id: "dell-2026-bg",
    title: "DELL 2026 BG",
    client: "DELL",
    date: "2026.04 – 2026.05",
    contribution: "1인 · 스타일프레임 디자인",
    description:
      "DELL 모니터의 색 재현력이 그대로 드러나야 하는 배경 아트워크라, 채도 높은 컬러들이 한 화면에서 충돌 없이 어울리도록 밸런스 있게 디자인하였습니다.",
    thumbnail: dellColorFrames[0],
    thumbnails: dellColorFrames,
    hero: `${DELL_COLOR_DIR}/2_page/optimized/hero.jpg`,
    gallery: dellColorGallery,
    category: ["ARTWORKS", "3D"],
    href: "/work/dell-2026-bg",  },
  {
    id: "lucky-spectrum",
    title: "Lucky Spectrum",
    client: "개인 프로젝트",
    date: "2023.05 – 2023.07",
    contribution: "1인 · 전체 작업",
    description:
      "스쳐 지나가는 도심 공간에 영상 속에서 변화하는 '뜻밖의 행운'의 순간을 포착할 수 있도록 연출한 개인 미디어아트 프로젝트입니다.",
    thumbnail: luckyFrames[0],
    thumbnails: luckyFrames,
    hero: `${LUCKY_DIR}/2_page/optimized/hero.jpg`,
    gallery: luckyGallery,
    category: ["3D", "MOTIONGRAPHIC"],
    href: "/work/lucky-spectrum",  },
  {
    id: "lucky-garden",
    title: "Lucky Garden",
    client: "개인 프로젝트",
    date: "2023.05 – 2023.07",
    contribution: "1인 · 전체 작업",
    description:
      "스쳐 지나가는 도심 공간에 영상 속에서 변화하는 '뜻밖의 행운'의 순간을 포착할 수 있도록 연출한 개인 미디어아트 프로젝트입니다.",
    thumbnail: gardenFrames[0],
    thumbnails: gardenFrames,
    hero: `${GARDEN_DIR}/2_page/optimized/hero.jpg`,
    gallery: gardenGallery,
    category: ["3D", "MOTIONGRAPHIC"],
    href: "/work/lucky-garden",  },
  {
    id: "lucky-christmas-lounge",
    title: "Lucky Christmas Lounge",
    client: "개인 프로젝트",
    date: "2023.05 – 2023.07",
    contribution: "1인 · 전체 작업",
    description:
      "스쳐 지나가는 도심 공간에 영상 속에서 변화하는 '뜻밖의 행운'의 순간을 포착할 수 있도록 연출한 개인 미디어아트 프로젝트입니다.",
    thumbnail: xmasFrames[0],
    thumbnails: xmasFrames,
    hero: `${XMAS_DIR}/2_page/optimized/hero.jpg`,
    gallery: xmasGallery,
    category: ["3D", "MOTIONGRAPHIC"],
    href: "/work/lucky-christmas-lounge",  },
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
    id: "lotte-nowon-vp-film",
    title: "LOTTE Dept. Nowon VP Film",
    client: "롯데백화점",
    date: "2026.02 – 2026.03",
    contribution: "1인 · 전체 작업",
    description:
      "모션 마네킹 뒤 디스플레이에 들어가는 영상이라, 상품을 가리지 않으면서 매장에 활기를 더해야 했습니다. 러닝의 움직임을 픽셀과 데이터 그래픽으로 추상화하고, 빠른 템포로 진행하여 멀리서도 속도감이 읽히도록 구성했습니다.",
    thumbnail: lotteFrames[0],
    thumbnails: lotteFrames,
    hero: `${LOTTE_DIR}/2_page/optimized/hero.jpg`,
    gallery: lotteGallery,
    category: ["2D", "MOTIONGRAPHIC"],
    href: "/work/lotte-nowon-vp-film",  },
  {
    id: "lg-brand-expressions",
    title: "LG Brand Expressions",
    description: TODO_DESCRIPTION,
    thumbnail: lgFrames[0],
    thumbnails: lgFrames,
    hero: `${LG_DIR}/2_page/optimized/hero.jpg`,
    gallery: lgGallery,
    // 본문 15장이 전부 16:9라 강약을 주는 기본 배치보다 3장씩 규칙적으로 놓는 편이 낫다
    galleryLayout: "trio",
    category: ["3D", "MOTIONGRAPHIC"],
    href: "/work/lg-brand-expressions",  },
  {
    id: "ibk-memorial-hall",
    title: "IBK memorial hall",
    client: "IBK 기업은행",
    date: "2025.06 – 2025.07",
    contribution: "1인 · 전체 작업",
    description:
      "IBK 홍보관 메인 영상으로, 은행이 지나온 시간을 한 편에 담아야 했습니다. 로고의 변천을 축으로 삼아, 시대마다 다른 공간과 재질 위에 로고를 놓으며 과거에서 미래까지를 하나의 흐름으로 이었습니다.",
    thumbnail: ibkFrames[0],
    thumbnails: ibkFrames,
    hero: `${IBK_DIR}/2_page/optimized/hero.jpg`,
    gallery: ibkGallery,
    // 본문에 세로(0.78:1)와 가로가 섞여 있어 정해진 틀에 넣으면 잘린다 — 원본 비율 그대로 쌓는다
    galleryLayout: "natural",
    category: ["3D", "MOTIONGRAPHIC"],
    href: "/work/ibk-memorial-hall",  },
  {
    id: "gs-homeshopping",
    title: "GS Homeshopping",
    client: "GS 홈쇼핑",
    date: "2025.03 – 2025.04",
    contribution: "2인 · 기획, 스타일프레임 디자인, 애니메틱",
    description:
      "브릿지 영상 특성상, 몇 초 안에 뷰티 채널임이 읽혀야 했습니다. 핑크 계열의 화사한 톤과 퍼프·리본 같은 부드러운 질감으로 화면을 채워 시선이 머물도록 구성했습니다.",
    thumbnail: gsFrames[0],
    thumbnails: gsFrames,
    hero: `${GS_DIR}/2_page/optimized/1.jpg`,
    // gallery 없음 — 2_page의 한 장을 히어로로 썼다. 본문은 썸네일 반복으로 자리만 잡는다
    category: ["3D", "MOTIONGRAPHIC"],
    href: "/work/gs-homeshopping",  },
  {
    id: "kbs-news-oap",
    title: "KBS NEWS OAP",
    client: "KBS",
    date: "2023.04 – 2023.06",
    contribution: "2인 · 기획, 스타일프레임 디자인, 애니메틱",
    description:
      "KBS 뉴스의 신뢰성과 첨단성을 빛과 파티클로 옮기고, 편성마다 다르게 전개하되 '빛의 라인'이라는 공통 규칙으로 채널 전체를 하나의 브랜드 아이덴티티로 묶은 OAP 디자인입니다.",
    thumbnail: kbsFrames[0],
    thumbnails: kbsFrames,
    hero: `${KBS_DIR}/2_page/optimized/hero.jpg`,
    gallery: kbsGallery,
    // 본문 20장이 전부 16:9라 강약을 주는 기본 배치보다 3장씩 규칙적으로 놓는 편이 낫다 (LG와 같다)
    galleryLayout: "trio",
    category: ["3D", "MOTIONGRAPHIC"],
    href: "/work/kbs-news-oap",  },
  {
    id: "naver-colloquium-2022",
    title: "Naver Colloquium 2022",
    client: "네이버",
    date: "2022.09 – 2022.11",
    contribution: "2인 · 스타일프레임 디자인, 애니메틱",
    description:
      "네이버의 한 해 기술 성과를 공유하는 콘퍼런스 영상으로, 눈에 보이지 않는 기술 성과를, 디지털 소재의 레이어가 합쳐지고 분해되기를 반복하는 연출로 은유한 영상입니다.",
    thumbnail: colloquiumFrames[0],
    thumbnails: colloquiumFrames,
    hero: `${COLLOQUIUM_DIR}/2_page/optimized/hero.jpg`,
    gallery: colloquiumGallery,
    // 본문 10장이 전부 0.6:1 세로라 기본 배치의 가로 틀에 넣으면 위아래가 크게 잘린다.
    // trio는 첫 장의 실제 비율을 모든 칸에 그대로 쓰므로 잘리는 데가 없다.
    galleryLayout: "trio",
    category: ["3D", "MOTIONGRAPHIC"],
    href: "/work/naver-colloquium-2022",  },
  {
    id: "bts-official-light-stick",
    title: "BTS Official Light Stick",
    client: "HYBE",
    date: "2025.10 – 2025.12",
    contribution: "4인 · 스타일프레임 디자인, 애니메틱",
    description:
      "BTS의 복귀에 맞춰 출시되는 응원봉으로, 제품 소개인 동시에 복귀를 알리는 신호가 되었던 영상입니다. 무대 조명이 터지는 순간을 그대로 연출로 옮겨, 응원봉의 발광 기능이 복귀의 장면으로 연상되도록 구성했습니다.",
    thumbnail: btsFrames[0],
    thumbnails: btsFrames,
    hero: `${BTS_DIR}/2_page/optimized/hero.jpg`,
    gallery: btsGallery,
    // 본문 9장이 전부 16:9 — 규칙적으로 3장씩 놓는다 (16~19번 공통)
    galleryLayout: "trio",
    category: ["3D", "MOTIONGRAPHIC"],
    href: "/work/bts-official-light-stick",  },
  {
    id: "samsung-wallet",
    title: "Samsung Wallet",
    client: "삼성전자",
    date: "2023.10 – 2024.01",
    contribution: "4인 · 스타일프레임 디자인, 애니메틱",
    description:
      "갤럭시 안에 담기는 다양한 서비스와 기능을 반복해서 보게 되는 새티스파잉한 연출로 풀고, 끝과 시작이 이어지는 루핑 구조로 구성했습니다.",
    thumbnail: walletFrames[0],
    thumbnails: walletFrames,
    hero: `${WALLET_DIR}/2_page/optimized/hero.jpg`,
    gallery: walletGallery,
    galleryLayout: "trio",
    category: ["3D", "MOTIONGRAPHIC"],
    href: "/work/samsung-wallet",  },
  {
    id: "cj-mama-2024",
    title: "CJ MAMA 2024",
    client: "CJ ENM",
    date: "2024.10 – 2024.11",
    contribution: "3인 · 기획, 스타일프레임 디자인, 애니메틱",
    description:
      "콘텐츠·푸드·뷰티까지 CJ 그룹의 여러 키워드를 'MAKES ONE'이라는 한 메시지로 묶어야 했습니다. 레트로 UI와 픽셀 그래픽, 콜라주를 공통 언어로 삼아 서로 다른 소재가 한 화면으로 읽히도록 구성했습니다.",
    thumbnail: mamaFrames[0],
    thumbnails: mamaFrames,
    hero: `${MAMA_DIR}/2_page/optimized/hero.jpg`,
    gallery: mamaGallery,
    galleryLayout: "trio",
    category: ["2D", "MOTIONGRAPHIC"],
    href: "/work/cj-mama-2024",  },
  {
    id: "livsmed",
    title: "LIVSMED",
    client: "리브스메드",
    date: "2025.04 – 2025.06",
    contribution: "4인 · 기획, 스타일프레임 디자인, 애니메틱",
    description:
      "수술 도구를 소개하는 영상이라, 시술 장면이 주는 부담을 덜면서 기능은 정확히 전달해야 했습니다. 장기를 풍선 스타일로 표현하여 시술 과정을 보여주고, 도구의 작동 원리는 그대로 읽히도록 구성했습니다.",
    thumbnail: livsmedFrames[0],
    thumbnails: livsmedFrames,
    hero: `${LIVSMED_DIR}/2_page/optimized/hero.jpg`,
    gallery: livsmedGallery,
    galleryLayout: "trio",
    category: ["3D", "MOTIONGRAPHIC"],
    href: "/work/livsmed",  },
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
