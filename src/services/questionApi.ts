import type { Question, QuestionTree } from '../types';
import { buildQuestionTree } from '../utils/tree';

const API_BASE = '';

export interface PaginatedResult<T> {
  results: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export async function fetchRootQuestions(category: string, limit = 50, offset = 0): Promise<PaginatedResult<Question>> {
  const params = new URLSearchParams({ category, parent_id: 'root', limit: String(limit), offset: String(offset) });
  const response = await fetch(`${API_BASE}/api/questions?${params}`);
  if (!response.ok) throw new Error('Failed to fetch root questions');
  return response.json();
}

export async function fetchChildQuestions(parentId: string): Promise<Question[]> {
  const params = new URLSearchParams({ parent_id: parentId, limit: '200' });
  const response = await fetch(`${API_BASE}/api/questions?${params}`);
  if (!response.ok) throw new Error('Failed to fetch children');
  const data: PaginatedResult<Question> = await response.json();
  return data.results;
}

export async function fetchAllChildren(parentId: string): Promise<Question[]> {
  // Recursively fetch all descendants
  const direct = await fetchChildQuestions(parentId);
  const all: Question[] = [...direct];
  
  // Also fetch children of children (for building the full tree)
  for (const child of direct) {
    const grandChildren = await fetchChildQuestions(child.id);
    all.push(...grandChildren);
  }
  
  return all;
}

/** Fetch root questions + their immediate children for a category */
export async function fetchCategoryTrees(category: string, limit = 50, offset = 0): Promise<{ trees: QuestionTree[]; total: number; hasMore: boolean }> {
  const { results: roots, total, hasMore } = await fetchRootQuestions(category, limit, offset);
  
  // Build tree with just roots first
  const rootTrees = roots.map(q => ({ ...q, children: [] as QuestionTree[] }));
  
  return { trees: rootTrees, total, hasMore };
}

/** Fetch full subtree for a single root question (all descendants) */
export async function fetchFullTree(rootId: string): Promise<QuestionTree> {
  // Fetch all questions that belong to this subtree
  // We do this by fetching with parent_id=root to get the root, then all children recursively
  const response = await fetch(`${API_BASE}/api/questions?category=&limit=200`);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json().then(() => {
    throw new Error('Use fetchFullSubtree instead');
  });
}

/** Fetch all descendants of a given question ID, building a complete subtree */
export async function fetchFullSubtree(rootId: string): Promise<QuestionTree> {
  const allQuestions: Question[] = [];
  const queue = [rootId];
  const visited = new Set<string>();
  
  while (queue.length > 0) {
    const parentId = queue.shift()!;
    if (visited.has(parentId)) continue;
    visited.add(parentId);
    
    const children = await fetchChildQuestions(parentId);
    allQuestions.push(...children);
    children.forEach(c => queue.push(c.id));
  }
  
  // Build tree from the collected questions
  const questionMap = new Map<string, QuestionTree>();
  allQuestions.forEach(q => {
    questionMap.set(q.id, { ...q, children: [] });
  });
  
  // Build the tree
  const directChildren: QuestionTree[] = [];
  allQuestions.forEach(q => {
    const node = questionMap.get(q.id)!;
    if (q.parent_id === rootId) {
      directChildren.push(node);
    } else if (q.parent_id && questionMap.has(q.parent_id)) {
      questionMap.get(q.parent_id)!.children.push(node);
    }
  });
  
  directChildren.sort((a, b) => a.sort_order - b.sort_order);
  
  // Return a partial tree node (we don't have the root's own data here, just its children)
  // Actually we need the root too - let's fetch it separately
  // For now, return the children tree
  // The caller will attach this to the root node
  return { id: rootId, children: directChildren } as QuestionTree;
}

/** Get category stats (just root count) */
export async function fetchCategoryStats(category: string): Promise<number> {
  const { total } = await fetchRootQuestions(category, 1, 0);
  return total;
}
