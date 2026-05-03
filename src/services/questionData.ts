/**
 * 前端数据加载服务 - 从构建时生成的 JSON 加载题库数据
 * 通过 Vite 动态 import 按分类加载，自动 code-split
 */
import type { QuestionTree } from '../types';

interface CategoryData {
  roots: QuestionTree[];
  total: number;
}

// Vite 动态 import 所有分类 JSON
const categoryModules = import.meta.glob<{ default: CategoryData }>(
  '../data/built/*.json',
  { eager: false }
);

// 内存缓存，加载过的分类不再重复请求
const cache = new Map<string, CategoryData>();

/**
 * 获取指定分类的题库数据（带缓存）
 */
export async function loadCategoryData(category: string): Promise<CategoryData> {
  const cached = cache.get(category);
  if (cached) return cached;

  const moduleKey = `../data/built/${category}.json`;
  const loader = categoryModules[moduleKey];
  if (!loader) {
    throw new Error(`Unknown category: ${category}`);
  }

  const mod = await loader();
  cache.set(category, mod.default);
  return mod.default;
}

/**
 * 预加载分类数据（不等待）
 */
export function preloadCategory(category: string): void {
  if (cache.has(category)) return;
  const moduleKey = `../data/built/${category}.json`;
  const loader = categoryModules[moduleKey];
  if (loader) {
    loader().then(mod => cache.set(category, mod.default)).catch(() => {});
  }
}

/**
 * 清除缓存
 */
export function clearCache(): void {
  cache.clear();
}
