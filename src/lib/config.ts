/**
 * 브랜드/카피.
 */
export const SITE = {
  headline: "Design beyond luck.",
  subtext: "Select a category",
  author: "LEE YU SEOK",
} as const;

/**
 * 좌상단 오브(ProfileOrb)를 누르면 펼쳐지는 프로필 — 직함 · 경력 · 연락처.
 * 경력은 배열을 그대로 줄로 그리므로 항목을 늘리거나 줄여도 된다 (위에서부터 순서대로).
 */
export const PROFILE = {
  role: "Motion Graphic Designer",
  career: [
    { company: "LOCUS", period: "2019.05 – 2021.05" },
    { company: "WOOT", period: "2022.04 – Present" },
  ],
  contact: [
    { label: "Mail", href: "mailto:dldbtjr001@gmail.com", external: false },
    { label: "Instagram", href: "https://www.instagram.com/u_lucks/", external: true },
  ],
} as const;
