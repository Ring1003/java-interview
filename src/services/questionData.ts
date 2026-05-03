/**
 * 前端数据加载服务 - 从构建时生成的 JSON 加载题库数据
 * 大分类自动拆分为多个 chunk，按需加载
 */
import type { QuestionTree } from '../types';

interface CategoryChunk {
  roots: QuestionTree[];
  total: number;
  chunkIndex?: number;
  chunkCount?: number;
}

interface CategoryInfo {
  chunks: string[];
  roots: number;
  total: number;
  size: string;
}

// Vite 动态 import 所有 built JSON
const allModules = import.meta.glob<{ default: unknown }>(
  '../data/built/*.json',
  { eager: false }
);

const builtModules = new Map<string, () => Promise<{ default: CategoryChunk }>>();
const manifestModule = allModules['../data/built/manifest.json'];

for (const [key, loader] of Object.entries(allModules)) {
  if (key.endsWith('manifest.json')) continue;
  const filename = key.split('/').pop()!.replace('.json', '');
  builtModules.set(filename, loader as () => Promise<{ default: CategoryChunk }>);
}

// manifest 缓存
let manifest: Record<string, CategoryInfo> | null = null;

// 已加载的 chunk 数据缓存
const chunkCache = new Map<string, CategoryChunk>();

/**
 * 加载 manifest
 */
async function loadManifest(): Promise<Record<string, CategoryInfo>> {
  if (manifest) return manifest;
  if (!manifestModule) throw new Error('manifest.json not found');
  const mod = await manifestModule();
  manifest = mod.default as Record<string, CategoryInfo>;
  return manifest;
}

/**
 * 获取分类的所有 chunk 文件名
 */
async function getChunkFiles(category: string): Promise<string[]> {
  const m = await loadManifest();
  const info = m[category];
  if (info?.chunks) return info.chunks;
  return [`${category}.json`];
}

/**
 * 加载指定分类的所有题库数据（合并所有 chunk）
 */
export async function loadCategoryData(category: string): Promise<CategoryChunk> {
  const cacheKey = category + ':all';
  const cached = chunkCache.get(cacheKey);
  if (cached) return cached;

  const chunkFiles = await getChunkFiles(category);
  const allRoots: QuestionTree[] = [];
  let total = 0;

  for (const file of chunkFiles) {
    const chunkKey = file.replace('.json', '');
    let chunk = chunkCache.get(chunkKey);

    if (!chunk) {
      const loader = builtModules.get(chunkKey);
      if (!loader) throw new Error(`Unknown chunk: ${chunkKey}`);
      const mod = await loader();
      chunk = mod.default;
      chunkCache.set(chunkKey, chunk);
    }

    allRoots.push(...chunk.roots);
    total = chunk.total;
  }

  const result: CategoryChunk = { roots: allRoots, total };
  chunkCache.set(cacheKey, result);
  return result;
}

/**
 * 预加载分类数据
 */
export function preloadCategory(category: string): void {
  loadCategoryData(category).catch(() => {});
}

/**
 * 清除缓存
 */
export function clearCache(): void {
  chunkCache.clear();
  manifest = null;
}
