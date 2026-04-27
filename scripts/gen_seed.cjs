const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const jsonFiles = [
  'java-basics.json',
  'concurrency.json',
  'jvm.json',
  'jvm_complete.json',
  'spring.json',
  'mysql.json',
  'redis.json',
  'redis_questions_batch1.json',
  'algorithm.json',
  'distributed.json'
];

let allQuestions = [];

for (const file of jsonFiles) {
  const fp = path.join(dataDir, file);
  if (fs.existsSync(fp)) {
    try {
      const data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
      allQuestions = allQuestions.concat(data);
      console.log('Loaded ' + data.length + ' from ' + file);
    } catch (e) {
      console.log('Error ' + file + ': ' + e.message);
    }
  }
}

// dedup
const map = new Map();
for (const q of allQuestions) { if (!map.has(q.id)) map.set(q.id, q); }
const unique = Array.from(map.values());
console.log('\nUnique: ' + unique.length);

const catStats = {};
for (const q of unique) { catStats[q.category] = (catStats[q.category] || 0) + 1; }
console.log('\nCategories:', JSON.stringify(catStats, null, 2));

// read schema
const schema = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf-8');

let inserts = '\n\n-- Seed Data (' + unique.length + ' questions)\n\n';
for (const q of unique) {
  const t = (q.title || '').replace(/'/g, "''");
  const a = (q.answer || '').replace(/'/g, "''");
  let tags = q.tags || '';
  if (Array.isArray(tags)) tags = tags.join(',');
  tags = tags.replace(/'/g, "''");
  const pid = q.parent_id ? "'" + q.parent_id + "'" : 'NULL';

  inserts += "INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (\n";
  inserts += "  '" + q.id + "',\n";
  inserts += "  '" + q.category + "',\n";
  inserts += "  " + q.level + ",\n";
  inserts += "  " + pid + ",\n";
  inserts += "  '" + t + "',\n";
  inserts += "  '" + a + "',\n";
  inserts += "  '" + tags + "',\n";
  inserts += "  " + (q.sort_order || 0) + "\n";
  inserts += ");\n\n";
}

fs.writeFileSync(path.join(__dirname, '../seed.sql'), schema + inserts);
const size = fs.statSync(path.join(__dirname, '../seed.sql')).size;
console.log('\nseed.sql: ' + (size / 1024 / 1024).toFixed(2) + ' MB');
