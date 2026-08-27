import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
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
      <body className="bg-cream font-sans text-ink antialiased">
        <SmoothScroll />
        {/* 커서와 페이지가 같은 카드 호버 상태를 보도록 둘 다 provider 안에 둔다 */}
        <CardHoverProvider>
          <CustomCursor />
          {children}
        </CardHoverProvider>
      </body>
    </html>
  );
}
