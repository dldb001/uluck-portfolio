"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

type CardHover = {
  /** 지금 호버 중인 카드 id (없으면 null) */
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
};

const CardHoverContext = createContext<CardHover>({
  hoveredId: null,
  setHoveredId: () => {},
});

/**
 * 카드 호버 상태를 layout 수준으로 끌어올린다.
 *
 * 이 상태를 쓰는 쪽이 서로 다른 트리에 있기 때문이다:
 *   · HomeScreen (헤드라인 blur · 가속 · 카드별 scale)
 *   · CustomCursor (layout에 마운트 — 점 확대 + 그라디언트)
 * 상태를 복제하지 않고 하나만 두려고 컨텍스트로 공유한다.
 */
export function CardHoverProvider({ children }: { children: ReactNode }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const pathname = usePathname();

  /**
   * 경로가 바뀌면 hover를 초기화한다.
   *
   * 이 상태는 layout에 있어서 페이지를 옮겨도 언마운트되지 않는다. 그래서 카드를 누르는
   * 순간의 hover가 상세 페이지를 거쳐 홈으로 돌아올 때까지 그대로 남아, 마우스가 올라가
   * 있지도 않은 카드가 확대된 채로 보였다. 진입할 때마다 껐다가, 실제로 커서가 카드 위에
   * 있으면 그리드의 좌표 판정이 다시 켜 준다.
   */
  useEffect(() => {
    setHoveredId(null);
  }, [pathname]);

  const value = useMemo(() => ({ hoveredId, setHoveredId }), [hoveredId]);

  return <CardHoverContext.Provider value={value}>{children}</CardHoverContext.Provider>;
}

export function useCardHover() {
  return useContext(CardHoverContext);
}
