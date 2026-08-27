/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 더미 썸네일이 SVG라 필요. 실제 이미지(JPG/PNG/WebP)로 교체되면 제거 가능.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
