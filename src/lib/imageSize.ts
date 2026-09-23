import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * public/ 아래 JPEG의 픽셀 크기를 파일 헤더에서 읽는다 — 서버 컴포넌트 전용 (빌드 때 정적 생성 중에 불린다).
 *
 * 상세 페이지 히어로는 manifest.json에 크기가 없는 경우가 많아, 비율을 여기서 직접 구한다.
 * JPEG는 SOF 마커(0xC0 ~ 0xCF, 단 C4 · C8 · CC 제외) 안에 높이 · 너비가 들어 있다.
 * 앞의 세그먼트들은 길이만 읽고 건너뛴다. 읽지 못하면(파일 없음 · JPEG 아님) null.
 */
export function jpegSize(publicPath: string): { width: number; height: number } | null {
  let buf: Buffer;
  try {
    buf = readFileSync(join(process.cwd(), "public", publicPath));
  } catch {
    return null;
  }
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;

  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return null;
    const marker = buf[i + 1];
    const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}
