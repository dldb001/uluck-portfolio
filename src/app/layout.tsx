import type { Metadata } from "next";
import { Poppins } from "next/font/google";
/*
  한글 본문용 Pretendard — 영문은 그대로 Poppins가 맡는다 (font-family 순서로 갈린다, tailwind.config.ts 참고).

  weight별 CSS를 따로 불러오는 건 이 파일들이 "dynamic subset" 방식이라서다. 한 weight가
  92개 청크로 쪼개져 있고 각 청크에 unicode-range가 붙어 있어, 브라우저가 화면에 실제로 쓰인
  글자가 든 청크만 내려받는다. 전체 파일(weight당 750KB)이나 통짜 서브셋(267KB)을 받는 것보다
  훨씬 가볍다.

  필요한 weight만 넣는다 — 여기 없는 굵기를 쓰면 브라우저가 있는 굵기를 합성해 뭉개진다.
  400 본문 / 500 제목·버튼 / 600·700 강조.
*/
import "pretendard/dist/web/static/Pretendard-Regular.css";
import "pretendard/dist/web/static/Pretendard-Medium.css";
import "pretendard/dist/web/static/Pretendard-SemiBold.css";
import "pretendard/dist/web/static/Pretendard-Bold.css";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import ProfileOrb from "@/components/ProfileOrb";
import { CardHoverProvider } from "@/components/CardHoverProvider";

// 헤드라인/본문 + 로고 워드마크.
// Gotham(유료) 대체 — 라이선스 자유로운 구글 폰트 중 지오메트릭 산세리프.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_TITLE = "LEE YU SEOK";
const SITE_DESCRIPTION =
  "Selected works — UI, motion graphics, 3D, 2D, artworks, media art.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  // 카카오톡 등 메신저의 미리보기 카드는 <title>보다 og 태그를 우선 참조한다
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_TITLE,
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={poppins.variable}>
      <body className="font-sans text-ink antialiased">
        <SmoothScroll />
        {/* 커서와 페이지가 같은 카드 호버 상태를 보도록 둘 다 provider 안에 둔다 */}
        <CardHoverProvider>
          <CustomCursor />
          {children}
        </CardHoverProvider>
        {/* 좌상단 프로필 오브 — 모든 페이지에 같은 자리로 떠 있다 (예전 하단 이름 pill을 대신한다) */}
        <ProfileOrb />
      </body>
    </html>
  );
}
