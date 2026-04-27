const fs = require('fs');
const path = require('path');

// 读取所有 JSON 文件
const dataDir = path.join(__dirname, '../data');
const jsonFiles = [
  'java-basics.json',
  'concurrency.json', 
  'jvm.json',
  'jvm_extended.json',
  'jvm_complete.json',
  'spring.json',
  'mysql.json',
  'redis.json',
  'redis_questions_batch1.json',
  'algorithm.json',
  'distributed.json'
];

let allQuestions = [];

jsonFiles.forEach(file => {
  try {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const questions = JSON.parse(content);
      allQuestions = allQuestions.concat(questions);
      console.log(`Loaded ${questions.length} questions from ${file}`);
    }
  } catch (e) {
    console.log(`Error loading ${file}:`, e.message);
  }
});

// 去重（基于 id）
const uniqueQuestions = [];
const seenIds = new Set();
allQuestions.forEach(q => {
  if (!seenIds.has(q.id)) {
    seenIds.add(q.id);
    uniqueQuestions.push(q);
  }
});

console.log(`\nTotal unique questions: ${uniqueQuestions.length}`);

// 分类统计
const categoryStats = {};
uniqueQuestions.forEach(q => {
  categoryStats[q.category] = (categoryStats[q.category] || 0) + 1;
});
console.log('\nCategory stats:', categoryStats);

// 生成 SQL
const schemaSQL = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf-8').split(';').filter(s => s.trim()).map(s => s.trim() + ';').join('\n\n');

let insertStatements = '\n\n-- Seed Data\n\n';
uniqueQuestions.forEach(q => {
  const escapedTitle = q.title.replace(/'/g, "''");
  const escapedAnswer = q.answer.replace(/'/g, "''");
  const tags = Array.isArray(q.tags) ? q.tags.join(',') : (q.tags || '');
  const escapedTags = tags.replace(/'/g, "''");
  
  insertStatements += `INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (\n`;
  insertStatements += `  '${q.id}',\n`;
  insertStatements += `  ${q.level},\n`;
  insertStatements += `  ${q.parent_id ? `'${q.parent_id}'` : 'NULL'},\n`;
  insertStatements += `  '${escapedTitle}',\n`;
  insertStatements += `  '${escapedAnswer}',\n`;
  insertStatements += `  '${escapedTags}',\n`;
  insertStatements += `  ${q.sort_order || 0}\n`;
  insertStatements += `);\n\n`;
});

const fullSQL = schemaSQL + insertStatements;
fs.writeFileSync(path.join(__dirname, '../seed.sql'), fullSQL);
console.log('\nGenerated seed.sql');
