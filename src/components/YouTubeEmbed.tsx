"use client";

import { useState } from "react";

/**
 * 유튜브 영상 한 편 — 누르기 전에는 포스터 + 재생 버튼, 누른 뒤에야 iframe을 불러온다(facade).
 *
 * 유튜브 플레이어는 iframe 하나에 스크립트가 수백 KB 따라온다. 상세 페이지에 영상이 셋이면
 * 보지도 않을 플레이어를 셋 다 받게 되므로, 실제로 재생하려는 순간까지 미룬다.
 *
 * 포스터는 외부 이미지(i.ytimg.com)라 next/image 대신 일반 <img>를 쓴다 — next/image로 받으려면
 * next.config에 도메인을 등록해야 해서 그 설정을 건드리지 않기 위해서다.
 *
 * iframe 위에서는 포인터 이벤트가 유튜브 문서로 넘어가 커스텀 커서가 좌표를 못 받는다.
 * 점이 가장자리에 멈춘 채 남지 않도록 들어가는 순간 "cursor:hide"를 보내 숨긴다
 * (CustomCursor가 받는다). 그 안에서는 유튜브가 그리는 기본 커서가 보이고,
 * 밖으로 나오면 다음 pointermove에서 점이 다시 켜진다.
 */

/** 영상이 올린 해상도에 따라 maxresdefault가 없으면 유튜브는 120x90 회색 자리표시를 준다 */
const MISSING_THUMB_WIDTH = 120;

export default function YouTubeEmbed({
  id,
  poster,
  title = "영상",
}: {
  id: string;
  poster?: string;
  title?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [thumb, setThumb] = useState(poster ?? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`);

  const hideCursor = () => window.dispatchEvent(new Event("cursor:hide"));

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[10px] bg-ink/5">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          onMouseEnter={hideCursor}
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label="영상 재생"
          className="group absolute inset-0 h-full w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt=""
            aria-hidden
            loading="lazy"
            draggable={false}
            onLoad={(e) => {
              // maxresdefault가 없는 영상 — 항상 있는 hqdefault(4:3, 위아래 띠 포함)로 내린다.
              // object-cover가 16:9 틀에 맞춰 띠 부분을 잘라내므로 그대로 써도 된다.
              if (!poster && e.currentTarget.naturalWidth === MISSING_THUMB_WIDTH) {
                setThumb(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
              }
            }}
            className="no-select absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />

          {/* 재생 버튼 — 배경색(surface) 원에 ink 삼각형. 유튜브 빨간 버튼 대신 사이트 톤에 맞춘다 */}
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 shadow-[0_4px_20px_rgba(20,20,20,0.12)] backdrop-blur-sm transition-transform duration-300 ease-out group-hover:scale-110 md:h-20 md:w-20"
          >
            <svg width="18" height="20" viewBox="0 0 18 20" className="ml-1 fill-ink" aria-hidden>
              <path d="M17 8.27a2 2 0 0 1 0 3.46L3 19.8A2 2 0 0 1 0 18.07V1.93A2 2 0 0 1 3 .2Z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
