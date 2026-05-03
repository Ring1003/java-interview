/**
 * 构建脚本：将 src/data/*.json 转换成按分类的树形结构 JSON
 * 输出到 src/data/built/{category}.json
 * 
 * 每个 built 文件结构：
 * {
 *   roots: QuestionTree[],  // 根级题目（level=0），children 已嵌套
 *   total: number           // 总题目数（含子问题）
 * }
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

// 分类 → 源文件映射
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

function buildTree(questions: Question[]): QuestionTree[] {
  const nodeMap = new Map<string, QuestionTree>();

  // 创建所有节点
  for (const q of questions) {
    const tags = typeof q.tags === 'string' ? q.tags : Array.isArray(q.tags) ? q.tags.join(',') : '';
    nodeMap.set(q.id, { ...q, tags, children: [] });
  }

  // 构建树
  const roots: QuestionTree[] = [];
  for (const q of questions) {
    const node = nodeMap.get(q.id)!;
    if (!q.parent_id || !nodeMap.has(q.parent_id)) {
      // 根节点
      roots.push(node);
    } else {
      // 挂到父节点下
      nodeMap.get(q.parent_id)!.children.push(node);
    }
  }

  // 排序：根节点按 sort_order，子节点也按 sort_order
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

// 确保 built 目录存在
if (!fs.existsSync(builtDir)) {
  fs.mkdirSync(builtDir, { recursive: true });
}

// 清理旧文件
for (const file of fs.readdirSync(builtDir)) {
  if (file.endsWith('.json')) {
    fs.unlinkSync(path.join(builtDir, file));
  }
}

let totalBuilt = 0;
const summary: Record<string, { roots: number; total: number; size: string }> = {};

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

  if (allQuestions.length === 0) {
    console.warn(`⚠️  No questions for category: ${category}`);
    continue;
  }

  // 只保留该分类的题目
  const categoryQuestions = allQuestions.filter(q => q.category === category);

  const roots = buildTree(categoryQuestions);
  const total = countAll(roots);

  const output = { roots, total };
  const outputPath = path.join(builtDir, `${category}.json`);
  const jsonStr = JSON.stringify(output);
  fs.writeFileSync(outputPath, jsonStr, 'utf-8');

  const sizeKB = (Buffer.byteLength(jsonStr, 'utf-8') / 1024).toFixed(1);
  summary[category] = { roots: roots.length, total, size: `${sizeKB}KB` };
  totalBuilt += roots.length;

  console.log(`✅ ${category}: ${roots.length} roots, ${total} total (${sizeKB}KB)`);
}

// 写入 manifest
const manifestPath = path.join(builtDir, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(summary, null, 2), 'utf-8');

console.log(`\n🎉 Built ${totalBuilt} root questions across ${Object.keys(summary).length} categories`);
console.log(`📁 Output: ${builtDir}`);
