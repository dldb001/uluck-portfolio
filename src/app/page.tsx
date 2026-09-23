import HomeScreen from "@/components/HomeScreen";

/**
 * 홈은 스크롤 없는 한 화면 레이아웃이다.
 * main이 뷰포트 높이(h-dvh)를 정확히 차지하는 세로 flex 컨테이너가 되어,
 * 히어로는 자기 높이만 쓰고 남는 세로 공간을 카드 그리드가 전부 가져간다.
 * 카드 크기는 그 남은 높이에서 역산되므로(ProjectCard 참고) 어떤 화면에서도 넘치지 않는다.
 * (연락처는 예전엔 맨 아래 이름 pill이었고 지금은 좌상단 오브(ProfileOrb, layout)에 있다)
 *
 * home-touch: 터치 기기에서 세로 팬을 막는다 (globals.css 참고). 그리드는 가로로만 넘어간다.
 *
 * pb: 카드 그리드 아래로 오브 지름(--orb)의 2배를 비운다 — 오브의 위·왼쪽 여백(1배)과 짝을 이루는 값.
 * 그리드 높이(52dvh)는 그대로이므로 그만큼 히어로 몫(flex-1)이 줄어든다.
 */
export default function Home() {
  return (
    <main className="home-touch flex h-dvh flex-col overflow-hidden pb-[calc(var(--orb)*2)]">
      <HomeScreen />
    </main>
  );
}
