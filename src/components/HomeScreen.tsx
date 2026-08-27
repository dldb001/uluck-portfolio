"use client";

import { useMemo, useState } from "react";
import Hero from "@/components/Hero";
import SearchInput from "@/components/SearchInput";
import CategoryButtons from "@/components/CategoryButtons";
import ProjectGrid from "@/components/ProjectGrid";
import { projects } from "@/data/projects";
import { CATEGORIES } from "@/lib/types";
import { filterProjects } from "@/lib/filter";
import { useCardHover } from "@/components/CardHoverProvider";

/**
 * `query` 상태 하나로 입력창 / 카테고리 버튼 하이라이트 / 그리드 필터링을 모두 동기화한다.
 */
export default function HomeScreen() {
  const [query, setQuery] = useState("");
  /**
   * 카드 그리드 전체를 통틀어 하나뿐인 hover 상태 — 호버 중인 카드의 id (없으면 null).
   * 헤드라인 blur · 카드별 scale · 커스텀 커서까지 모두 이 값 하나에서 갈라져 나오므로
   * layout의 CardHoverProvider에 두고 여기서는 꺼내 쓰기만 한다.
   */
  const { hoveredId, setHoveredId } = useCardHover();

  const visibleProjects = useMemo(
    () => filterProjects(projects, query),
    [query],
  );

  return (
    <>
      <Hero blurred={hoveredId !== null}>
        <SearchInput value={query} onChange={setQuery} />
        <CategoryButtons
          categories={CATEGORIES}
          active={query}
          onSelect={setQuery}
        />
      </Hero>

      <ProjectGrid
        projects={visibleProjects}
        hoveredId={hoveredId}
        onCardHoverChange={setHoveredId}
      />
    </>
  );
}
