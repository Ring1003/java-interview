#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
const outputFile = path.join(__dirname, 'seed.sql');

const categories = [
  'java-basics',
  'concurrency',
  'jvm',
  'spring',
  'mysql',
  'redis',
  'algorithm',
  'distributed'
];

let allQuestions = [];

categories.forEach(category => {
  const filePath = path.join(dataDir, `${category}.json`);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = JSON.parse(content);
    allQuestions = allQuestions.concat(questions);
  }
});

console.log(`Total questions: ${allQuestions.length}`);

// Read schema and add INSERT statements
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
let seedSql = schema + '\n\n-- Seed Questions\n\n';

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + str.replace(/'/g, "''").replace(/\n/g, '\\n') + "'";
}

allQuestions.forEach(q => {
  seedSql += `INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  ${escapeSql(q.id)},
  ${escapeSql(q.category)},
  ${q.level},
  ${q.parent_id ? escapeSql(q.parent_id) : 'NULL'},
  ${escapeSql(q.title)},
  ${escapeSql(q.answer)},
  ${escapeSql(q.tags || '')},
  ${q.sort_order || 0}
);\n`;
});

fs.writeFileSync(outputFile, seedSql);
console.log(`Seed SQL written to ${outputFile}`);
