import type { Category, Project } from "@/lib/types";

/** 입력값이 비어있으면 전체 노출, 아니면 카테고리 부분 일치(대소문자 무시) */
export function filterProjects(projects: Project[], query: string): Project[] {
  const q = query.trim().toUpperCase();
  if (!q) return projects;
  return projects.filter((p) => p.category.some((cat) => cat.includes(q)));
}

/**
 * 타이핑 중 실시간 하이라이트 판정.
 * 입력값이 비어있으면 어떤 버튼도 하이라이트되지 않는다.
 */
export function isCategoryActive(category: Category, query: string): boolean {
  const q = query.trim().toUpperCase();
  return q.length > 0 && category.includes(q);
}
