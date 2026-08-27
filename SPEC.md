# 포트폴리오 사이트 스펙 (DixonBaxi 스타일 참고)

## 1. 기술 스택
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Framer Motion (애니메이션, 필터 re-layout, drag)
- Lenis (부드러운 스크롤)

## 2. 컬러 / 타이포그래피
- 배경: `#F7F4EC` (크림/오프화이트)
- 텍스트(기본): `#141414` (블랙)
- 서브텍스트(연한 설명): 연회색, 낮은 opacity
- 로고 폰트: 굵은 지오메트릭 산세리프
- 헤드라인 폰트: 라운드 산세리프, 대형 사이즈 (모바일 40px ~ 데스크톱 100px 반응형)
- "NEW WORK" 배지: 크림톤 pill 배경 + 블랙 텍스트, 카드 좌하단에 위치

## 3. 페이지 구조 (메인/홈)

### 3-1. 헤더
- 중앙 정렬 로고 "DixonBaxi" (→ 실제 서비스명으로 교체 예정)

### 3-2. 히어로 섹션
- 대형 헤드라인: "Ask us anything." (→ 실제 문구로 교체 예정)
- 서브텍스트: "Even a random thought." (placeholder 텍스트로 사용)
- **검색/입력창**
  - 밑줄 스타일 input, placeholder = 서브텍스트
  - 우측에 화살표 아이콘 (제출 버튼, 지금은 시각적 요소만, 기능은 추후 연결)
  - 입력값은 아래 카테고리 필터와 실시간 동기화되는 단일 상태(`query`)
- **카테고리 버튼 (항상 노출, 자동완성 겸용)**
  - 카테고리: `UI`, `MOTIONGRAPHIC`, `3D`, `2D`, `ARTWORKS`, `MEDIA ART`
  - 클릭 시: 입력창에 해당 텍스트 세팅 + 버튼 active 하이라이트 + 그리드 즉시 필터링
  - 타이핑 중: 매칭되는 카테고리 버튼이 실시간 하이라이트
  - 입력값이 비어있으면(both empty) 전체 프로젝트 노출, 버튼 하이라이트 없음

### 3-3. 프로젝트 그리드
- 가로로 길게 배치된 카드들, 화면 밖으로 넘치는 형태(잘려서 시작/끝)
- **드래그 스크롤**: 마우스 클릭한 채로 좌우 드래그하면 횡스크롤 (Framer Motion `drag="x"` + `dragConstraints` 활용)
  - 드래그 이동거리가 일정 threshold(예: 5px) 이상이면 "드래그"로 간주하여 클릭 이벤트(라우팅) 취소
  - threshold 미만이면 "클릭"으로 간주하여 상세 페이지로 이동
- 카드 비율은 프로젝트마다 다양 (정사각형에 가까운 것 ~ 세로형)
- 필터링 시 카드들이 부드럽게 재배열 (Framer Motion `layout` + `AnimatePresence`)
- 각 카드: 썸네일 이미지, (선택) "NEW WORK" 배지

### 3-4. 데이터 구조

```ts
type Category = "UI" | "MOTIONGRAPHIC" | "3D" | "2D" | "ARTWORKS" | "MEDIA ART";

interface Project {
  id: string;
  title: string;
  thumbnail: string;   // public/images 경로 or 외부 URL
  category: Category[]; // 여러 카테고리 중복 태깅 가능
  isNewWork?: boolean;
  href: string;         // 상세 페이지 경로 (/work/[id])
}
```

### 3-5. 필터 로직

```ts
function filterProjects(projects: Project[], query: string): Project[] {
  const q = query.trim().toUpperCase();
  if (!q) return projects;
  return projects.filter((p) => p.category.some((cat) => cat.includes(q)));
}
```

## 4. 컴포넌트 구조 제안

```
<Header />
<Hero>
  <Headline />
  <SearchInput value={query} onChange={setQuery} />
  <CategoryButtons categories={CATEGORIES} active={query} onSelect={setQuery} />
</Hero>
<ProjectGrid projects={filterProjects(allProjects, query)} />
```

`query` 상태 하나로 입력창 / 버튼 하이라이트 / 그리드 필터링을 모두 동기화.

## 5. 아직 결정되지 않은 것 (진행하며 확정)
- 케이스 스터디 상세 페이지 레이아웃
- 실제 로고/브랜드명, 헤드라인 문구 (현재는 참고용 placeholder)
- 입력창 제출(엔터/화살표 클릭) 시 동작 — 현재는 시각 요소만, 추후 연결
- 실제 프로젝트 콘텐츠(이미지, 제목, 카테고리 태깅)

## 6. 저작권/주의사항
- 실제 배포 전, DixonBaxi의 텍스트·이미지·클라이언트 로고는 전부 본인 콘텐츠로 교체할 것
- 참고하는 것은 레이아웃 구조와 인터랙션 패턴에 한정
