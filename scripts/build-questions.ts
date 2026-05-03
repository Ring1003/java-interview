/**
 * 构建脚本：将 src/data/*.json 转换成按分类的树形结构 JSON
 * 对大分类自动拆分为多个 chunk（每 chunk 最多 30 个根题）
 */

import fs from 'fs';
import path from 'path';

interface Question {
  id: string;
  category: string;
  level: number;
  parent_id: string | null;
  title: string;
  answer: string;
  tags: string | string[];
  sort_order: number;
}

interface QuestionTree extends Question {
  children: QuestionTree[];
}

const CATEGORY_FILES: Record<string, string[]> = {
  'java-basics': ['java-basics.json'],
  'concurrency': ['concurrency.json'],
  'jvm': ['jvm.json'],
  'spring': ['spring.json'],
  'mysql': ['mysql.json'],
  'redis': ['redis.json'],
  'algorithm': ['algorithm.json'],
  'distributed': ['distributed.json'],
};

const MAX_ROOTS_PER_CHUNK = 30;

function buildTree(questions: Question[]): QuestionTree[] {
  const nodeMap = new Map<string, QuestionTree>();

  for (const q of questions) {
    const tags = typeof q.tags === 'string' ? q.tags : Array.isArray(q.tags) ? q.tags.join(',') : '';
    nodeMap.set(q.id, { ...q, tags, children: [] });
  }

  const roots: QuestionTree[] = [];
  for (const q of questions) {
    const node = nodeMap.get(q.id)!;
    if (!q.parent_id || !nodeMap.has(q.parent_id)) {
      roots.push(node);
    } else {
      nodeMap.get(q.parent_id)!.children.push(node);
    }
  }

  roots.sort((a, b) => a.sort_order - b.sort_order);
  const sortChildren = (nodes: QuestionTree[]) => {
    for (const node of nodes) {
      node.children.sort((a, b) => a.sort_order - b.sort_order);
      sortChildren(node.children);
    }
  };
  sortChildren(roots);

  return roots;
}

function countAll(nodes: QuestionTree[]): number {
  let count = 0;
  for (const node of nodes) {
    count += 1 + countAll(node.children);
  }
  return count;
}

// 主逻辑
const dataDir = path.resolve(import.meta.dirname, '../src/data');
const builtDir = path.resolve(dataDir, 'built');

if (!fs.existsSync(builtDir)) {
  fs.mkdirSync(builtDir, { recursive: true });
}

for (const file of fs.readdirSync(builtDir)) {
  if (file.endsWith('.json')) {
    fs.unlinkSync(path.join(builtDir, file));
  }
}

let totalBuilt = 0;
const manifest: Record<string, {
  chunks: string[];
  roots: number;
  total: number;
  size: string;
}> = {};

for (const [category, files] of Object.entries(CATEGORY_FILES)) {
  const allQuestions: Question[] = [];

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filePath}`);
      continue;
    }

    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const items: Question[] = Array.isArray(raw) ? raw : [raw];
    allQuestions.push(...items);
  }

  if (allQuestions.length === 0) continue;

  const categoryQuestions = allQuestions.filter(q => q.category === category);
  const roots = buildTree(categoryQuestions);
  const total = countAll(roots);

  const chunks: string[] = [];

  if (roots.length <= MAX_ROOTS_PER_CHUNK) {
    // 不拆分
    const output = { roots, total };
    const outputPath = path.join(builtDir, `${category}.json`);
    const jsonStr = JSON.stringify(output);
    fs.writeFileSync(outputPath, jsonStr, 'utf-8');
    chunks.push(`${category}.json`);
    const sizeKB = (Buffer.byteLength(jsonStr, 'utf-8') / 1024).toFixed(1);
    console.log(`✅ ${category}: ${roots.length} roots, ${total} total (${sizeKB}KB)`);
    manifest[category] = { chunks, roots: roots.length, total, size: `${sizeKB}KB` };
    totalBuilt += roots.length;
  } else {
    // 拆分为多个 chunk
    let totalSize = 0;
    for (let i = 0; i < roots.length; i += MAX_ROOTS_PER_CHUNK) {
      const chunkRoots = roots.slice(i, i + MAX_ROOTS_PER_CHUNK);
      const chunkIndex = Math.floor(i / MAX_ROOTS_PER_CHUNK);
      const chunkName = `${category}-${chunkIndex}.json`;
      const output = { roots: chunkRoots, total, chunkIndex, chunkCount: Math.ceil(roots.length / MAX_ROOTS_PER_CHUNK) };
      const jsonStr = JSON.stringify(output);
      const outputPath = path.join(builtDir, chunkName);
      fs.writeFileSync(outputPath, jsonStr, 'utf-8');
      chunks.push(chunkName);
      totalSize += Buffer.byteLength(jsonStr, 'utf-8');
      const sizeKB = (Buffer.byteLength(jsonStr, 'utf-8') / 1024).toFixed(1);
      console.log(`  📦 ${chunkName}: ${chunkRoots.length} roots (${sizeKB}KB)`);
    }
    const sizeKB = (totalSize / 1024).toFixed(1);
    console.log(`✅ ${category}: ${roots.length} roots, ${total} total → ${chunks.length} chunks (${sizeKB}KB)\n`);
    manifest[category] = { chunks, roots: roots.length, total, size: `${sizeKB}KB` };
    totalBuilt += roots.length;
  }
}

const manifestPath = path.join(builtDir, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

console.log(`\n🎉 Built ${totalBuilt} root questions across ${Object.keys(manifest).length} categories`);
console.log(`📁 Output: ${builtDir}`);
