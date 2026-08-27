import Footer from "@/components/Footer";
import HomeScreen from "@/components/HomeScreen";

/**
 * 홈은 스크롤 없는 한 화면 레이아웃이다.
 * main이 뷰포트 높이(h-dvh)를 정확히 차지하는 세로 flex 컨테이너가 되어,
 * 히어로와 푸터는 자기 높이만 쓰고 남는 세로 공간을 카드 그리드가 전부 가져간다.
 * 카드 크기는 그 남은 높이에서 역산되므로(ProjectCard 참고) 어떤 화면에서도 넘치지 않는다.
 */
export default function Home() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <HomeScreen />
      <Footer />
    </main>
  );
}
