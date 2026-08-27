# Portfolio

작업물을 한 화면에 모아 보여주는 개인 포트폴리오 사이트.
홈은 헤드라인 · 검색 · 카테고리 필터 · 가로 드래그 카드 그리드가 한 화면에 맞물려 있고,
카드를 누르면 상세 페이지로 들어간다.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
```

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 (상세 페이지는 전부 정적 생성) |
| `npm run start` | 빌드 결과 실행 |
| `npm run lint` | ESLint |

> `npm run build`는 `.next/`를 다시 쓴다. 개발 서버를 켜 둔 채로 빌드하면 실행 중인
> 서버가 청크를 잃고 500을 뱉으므로, 빌드 전에 개발 서버를 먼저 끄는 편이 안전하다.

## 스택

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Lenis(부드러운 스크롤) · sharp(이미지 최적화)

## 구조

```
src/
  app/
    page.tsx              홈
    work/[id]/page.tsx    상세 페이지 (generateStaticParams로 정적 생성)
    layout.tsx            폰트 · 커스텀 커서 · 카드 호버 컨텍스트
  components/
    HomeScreen.tsx        히어로 + 그리드를 한 화면에 묶는 조립부
    ProjectGrid.tsx       가로 드래그 트랙 · 좌표 기반 호버 판정
    ProjectCard.tsx       카드 한 장 (호버 시 썸네일 순환)
    ProjectGallery.tsx    상세 페이지 본문 이미지 그리드
    CardHoverProvider.tsx 그리드 · 헤드라인 · 커서가 공유하는 단일 호버 상태
  data/projects.ts        프로젝트 목록 (제목 · 카테고리 · 이미지 경로)
  lib/                    타입 · 필터 · 공용 클래스 상수
scripts/
  optimize-images.mjs     원본 → 최적화 이미지 변환
public/images/projects/   프로젝트별 이미지
```

## 이미지 파이프라인

프로젝트 이미지는 **원본 폴더를 그대로 두고**, 최적화한 사본만 `optimized/`에 만들어 쓴다.
`src/data/projects.ts`가 가리키는 건 언제나 `optimized/` 쪽이다.

```
public/images/projects/<프로젝트>/
  1_thumbnail/            카드 썸네일 원본 (900x1200, 3:4)
    optimized/            ← 실제로 서비스되는 파일 + manifest.json
  2_page/                 상세 페이지 원본
    optimized/            ← 실제로 서비스되는 파일 + manifest.json
```

파일 이름 규칙은 두 폴더가 같다. `hero`가 대표 이미지(카드 기본 썸네일 / 상세 히어로)이고,
나머지 번호들이 카드 호버 순환 프레임 / 본문 그리드 이미지가 된다.

> **원본(PNG)은 저장소에 없다.** 서비스되지 않는데 206MB나 되어 `.gitignore`로 뺐다.
> 저장소에 있는 건 `optimized/` 결과물뿐이라 클론만 해도 빌드·배포는 그대로 된다.
> 다만 이미지를 다시 뽑으려면 원본이 필요하므로, 원본은 로컬이나 별도 저장소에 보관해야 한다.

### 변환

```bash
# 카드 썸네일 — 3:4 중앙 크롭, 카드 렌더 크기(408px)의 2배 이상
node scripts/optimize-images.mjs "public/images/projects/<프로젝트>/1_thumbnail" \
  --out "public/images/projects/<프로젝트>/1_thumbnail/optimized" \
  --width 900 --quality 95 --aspect 3:4

# 상세 페이지 — 원본 비율 유지, 원본 해상도 그대로 (업스케일은 하지 않는다)
node scripts/optimize-images.mjs "public/images/projects/<프로젝트>/2_page" \
  --out "public/images/projects/<프로젝트>/2_page/optimized" \
  --width <원본 폭> --quality 92 --aspect none
```

옵션은 `scripts/optimize-images.mjs` 상단 주석 참고. 원본에 덮어쓰려면 `--replace`를
명시해야 하므로 실수로 원본이 사라지지 않는다.

### manifest.json

변환할 때마다 결과물의 픽셀 크기를 `manifest.json`으로 함께 남긴다.
상세 페이지 그리드가 이 값으로 **파노라마(가로 ÷ 세로 ≥ 2)** 를 가려내, 비율이 고정된 틀에
넣어 좌우가 잘리는 대신 자기 비율 그대로 한 행을 쓰게 한다.
비율을 코드에 손으로 적지 않으므로 이미지를 다시 뽑으면 레이아웃도 자동으로 따라 바뀐다.

## 프로젝트 추가

1. `public/images/projects/<프로젝트>/1_thumbnail`(필요하면 `2_page`)에 원본을 넣는다.
2. 위 변환 명령을 돌린다.
3. `src/data/projects.ts`에 항목을 추가한다 — `id` · `title` · `category` · `href`와
   `optimized/` 이미지 경로. `2_page`가 아직 없으면 `hero`/`gallery`를 비워 두면 되고,
   그러면 상세 페이지가 썸네일로 자리만 잡아 준다.
