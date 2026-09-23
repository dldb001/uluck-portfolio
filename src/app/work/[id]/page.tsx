import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import HomeScreen from "@/components/HomeScreen";
import ProjectGallery from "@/components/ProjectGallery";
import { projects } from "@/data/projects";
import { isGalleryText } from "@/lib/types";
import { PROSE_TEXT, PROSE_W } from "@/lib/styles";
import { jpegSize } from "@/lib/imageSize";

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

/*
  상세 정보 텍스트 크기. 제목(text-headline)과 Back 링크는 기준 크기 그대로 두고, 아래만 줄인다:
    메타 라벨   11px → 7.7px           (기준의 70%)
    메타 값     14px → 9.8px   (md 15px → 10.5px)   (기준의 70%)
    설명 문단   16px → 13.44px (md 18px → 15.12px)  (기준의 84% — 그리드 사이 본문과 같은 크기)
  줄 간격은 배수(/[1.9])로 적혀 있어 글자 크기를 따라 자동으로 같이 줄어든다.

  두께는 font-semibold(600)이다. 한글은 Pretendard가 그리는데 이 크기에서는 400·500이 얇게 보인다.
  600은 layout.tsx에서 실제로 불러오는 웨이트라 브라우저가 합성하지 않고 SemiBold 원본을 쓴다.
  설명 문단의 클래스는 그리드 사이 문단과 공유하므로 lib/styles.ts(PROSE_TEXT)에 있다.
*/

/** 갤러리에 최소한 이만큼은 깔아 레이아웃이 비어 보이지 않게 한다 */
const MIN_GALLERY = 3;

/**
 * 본문 컨테이너 폭 — 좌우 여백을 "예전의 절반"으로 줄인 값.
 *
 * 예전에는 `w-full max-w-6xl`이라 한쪽 여백이 (부모폭 − 72rem) / 2 였다.
 * 그 여백을 절반으로 줄이면 한쪽 여백 = (부모폭 − 72rem) / 4 이고,
 * 그때 폭은 부모폭 − (부모폭 − 72rem) / 2 = (부모폭 + 72rem) / 2 가 된다.
 * (1920px 화면 기준: 폭 1152px·여백 384px → 폭 1536px·여백 192px)
 *
 * 기준을 100vw가 아니라 100%(= main의 폭)로 잡는 이유는 세로 스크롤바 때문이다.
 * 100vw는 스크롤바 폭까지 포함해서, 스크롤바가 자리를 차지하는 환경에서는
 * 계산이 그만큼 어긋나 가로로 삐져나간다.
 *
 * max-w-full은 좁은 화면용 안전장치다. 부모폭이 72rem보다 작아지면 위 식의 결과가
 * 부모폭보다 커지는데, 그때는 다시 부모폭으로 눌러 예전과 똑같이 동작하게 한다.
 */
const CONTENT_W = "w-[calc((100%_+_72rem)/2)] max-w-full";

/** 히어로 크기를 읽지 못했을 때의 비율 — 히어로 대부분이 3:1 안팎의 파노라마다 */
const HERO_FALLBACK_RATIO = "3 / 1";

export default function WorkDetail({ params }: { params: { id: string } }) {
  const project = projects.find((p) => p.id === params.id);
  if (!project) notFound();

  const hero = project.hero ?? project.thumbnail;
  const heroSize = jpegSize(hero);

  /**
   * 제목 아래 메타 — 값이 있는 항목만 줄이 된다.
   *
   * 카테고리는 모든 프로젝트에 있지만 나머지 셋은 PDF 정보를 채운 프로젝트에만 있다
   * (PROJECT_DETAILS.md 참고). 그래서 항목 수가 1개인 프로젝트와 4개인 프로젝트가 섞인다.
   */
  const meta = [
    { label: "Category", value: project.category.join(", ") },
    { label: "Client", value: project.client },
    { label: "Date", value: project.date },
    { label: "Contribution", value: project.contribution },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));

  // 전용 갤러리가 있으면 그대로 쓰고, 없으면 레이아웃 확인용으로 썸네일을 반복해서 채운다.
  // TODO: 나머지 프로젝트도 실제 상세 이미지로 교체
  const gallery =
    project.gallery?.length
      ? project.gallery
      : Array.from({ length: MIN_GALLERY }, () => ({ src: project.thumbnail }));

  /**
   * 본문이 문단으로 시작하면 소개 문단과 글이 곧장 이어진다 — 그 사이는 이미지 앞 여백(9vh)이
   * 아니라 빈 줄 하나(ProjectGallery의 Paragraph가 mt-[1.9em]으로 준다)여야 한다.
   * 그래서 이 경우 소개 섹션의 아래 패딩을 뺀다. 패딩은 마진과 상쇄되지 않아 그대로 더해진다.
   */
  const leadsWithText = isGalleryText(gallery[0]);

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/*
        1. 뒤로가기 + 제목 — 아래 이미지 그리드와 같은 폭(CONTENT_W)으로 좌우를 맞춘다.
        (좌상단 프로필 오브는 상세 페이지에서 그리지 않으므로 Back 링크와 겹칠 걱정 없이 5vh에서 시작한다)
      */}
      <header className={`mx-auto ${CONTENT_W} px-3 pt-[5vh]`}>
        <Link
          href="/"
          aria-label="홈으로 돌아가기"
          className="inline-flex items-center gap-2 text-ink/60 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          <span className="text-sm">Back</span>
        </Link>

        {/*
          홈 헤드라인과 같은 그레이 그라디언트 레이어를 재사용해 톤을 맞춘다.

          background-clip:text는 "요소 박스 안에 칠해진 배경"을 글자 모양으로 오려내는 방식이라,
          글자가 박스 밖으로 삐져나가면 그 부분엔 칠할 배경이 없어 그대로 사라진다.
          text-headline의 line-height가 1.02라 g·y 같은 디센더가 박스 아래로 나가 잘렸다.
          leading으로 줄 상자를 넉넉히 잡고 pb로 배경 영역을 한 번 더 밀어 내려 확실히 덮는다.
          (홈 히어로는 줄 간격이 레이아웃 계산에 묶여 있어 text-headline 자체는 건드리지 않는다)
        */}
        <h1 className="headline-layer headline-layer--gray text-headline mt-[3vh] pb-[0.12em] font-medium leading-[1.25]">
          {project.title}
        </h1>

        {/*
          메타 — 케이스 스터디처럼 제목 바로 아래에 Client · Date · 참여 정보를 둔다.
          항목 수가 프로젝트마다 달라(PDF에 없는 프로젝트는 Category 하나뿐) 고정 열 수 대신 flex-wrap으로
          채운다. 라벨은 홈 카테고리 버튼과 같은 대문자 + 자간 스타일을 쓴다.
        */}
        <dl className="mt-[4vh] flex flex-wrap gap-x-12 gap-y-6 border-t border-ink/10 pt-6">
          {meta.map((item) => (
            <div key={item.label} className="min-w-[8rem]">
              <dt className="text-[7.7px] font-semibold uppercase tracking-[0.16em] text-ink/40">
                {item.label}
              </dt>
              <dd className="mt-2 text-[9.8px] font-semibold text-ink/75 md:text-[10.5px]">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      {/*
        2. 히어로 — 좌우 여백 없이 화면 가로를 꽉 채우고, 높이는 그림의 원본 비율로 정한다.
        예전엔 높이를 56vh / 68vh로 고정해 창을 좁힐수록 object-cover가 좌우를 잘라냈다(3:1 파노라마가 375px에서 거의
        정사각형만 남았다). 상자 비율이 그림과 같으면 어느 폭에서나 잘리는 곳 없이 그대로 줄고 는다.
      */}
      <div
        className="relative mt-[5vh] w-full bg-ink/5"
        style={{ aspectRatio: heroSize ? `${heroSize.width} / ${heroSize.height}` : HERO_FALLBACK_RATIO }}
      >
        <Image
          src={hero}
          alt={project.title}
          fill
          priority
          draggable={false}
          sizes="100vw"
          // 부드러운 그라디언트 아트워크라 기본 품질(75)에선 밴딩이 눈에 띈다
          quality={90}
          className="no-select object-cover"
        />
      </div>

      {/*
        3. 설명 — 그리드와 같은 CONTENT_W 컨테이너 안에 PROSE_W로 놓는다.
        그리드 사이 문단(ProjectGallery)도 정확히 이 구조라 두 문단의 왼쪽 시작점이 일치한다.
        (PROSE_W가 부모 폭 기준이라 컨테이너가 다르면 시작점이 어긋난다 — lib/styles.ts 참고)
      */}
      <section className={`mx-auto ${CONTENT_W} px-3 pt-[9vh] ${leadsWithText ? "" : "pb-[9vh]"}`}>
        <p className={`${PROSE_W} ${PROSE_TEXT}`}>{project.description}</p>
      </section>

      {/* 4. 이미지 그리드 — 블록 크기를 섞어 강약을 준다 (ProjectGallery 참고) */}
      <section className={`mx-auto ${CONTENT_W} px-3 pb-[10vh]`}>
        <ProjectGallery images={gallery} layout={project.galleryLayout} />
      </section>

      {/*
        5. 홈 화면 그대로 재사용 — 헤드라인 · 검색창 · 카테고리 버튼 · 카드 그리드.
        HomeScreen은 "한 화면에 딱 맞는" 레이아웃(Hero가 flex-1, 그리드가 h-[52dvh])을 전제로
        만들어져 있어서, 여기서도 높이가 확정된 h-dvh 세로 flex 컨테이너로 감싸야 카드 크기
        계산(100cqh)이 홈과 동일하게 동작한다. 카드 트랙이 좌우로 넘치므로 overflow-hidden도 함께.
        pb(오브 지름의 2배)도 홈(app/page.tsx)과 같은 값이다.
      */}
      <div className="flex h-dvh flex-col overflow-hidden border-t border-ink/10 pb-[calc(var(--orb)*2)]">
        <HomeScreen />
      </div>
    </main>
  );
}
