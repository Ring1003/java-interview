#!/usr/bin/env python3
import json
import os
import glob

data_dir = os.path.join(os.path.dirname(__file__), '../data')

json_files = [
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
]

all_questions = []

for file in json_files:
    filepath = os.path.join(data_dir, file)
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                questions = json.load(f)
                all_questions.extend(questions)
                print(f"Loaded {len(questions)} questions from {file}")
        except Exception as e:
            print(f"Error loading {file}: {e}")

# 去重
unique_questions = []
seen_ids = set()
for q in all_questions:
    if q['id'] not in seen_ids:
        seen_ids.add(q['id'])
        unique_questions.append(q)

print(f"\nTotal unique questions: {len(unique_questions)}")

# 分类统计
category_stats = {}
for q in unique_questions:
    cat = q['category']
    category_stats[cat] = category_stats.get(cat, 0) + 1

print("\nCategory stats:")
for cat, count in sorted(category_stats.items()):
    print(f"  {cat}: {count}")

# 读取 schema
schema_path = os.path.join(os.path.dirname(__file__), '../schema.sql')
with open(schema_path, 'r', encoding='utf-8') as f:
    schema_sql = f.read()

# 生成 INSERT 语句
def escape_sql(text):
    return text.replace("'", "''")

insert_statements = "\n\n-- Seed Data\n\n"
for q in unique_questions:
    escaped_title = escape_sql(q['title'])
    escaped_answer = escape_sql(q['answer'])
    tags = q.get('tags', '')
    if isinstance(tags, list):
        tags = ','.join(tags)
    escaped_tags = escape_sql(tags)
    
    parent_id = q.get('parent_id')
    parent_sql = f"'{parent_id}'" if parent_id else "NULL"
    
    insert_statements += f"""INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  '{q['id']}',
  '{q['category']}',
  {q['level']},
  {parent_sql},
  '{escaped_title}',
  '{escaped_answer}',
  '{escaped_tags}',
  {q.get('sort_order', 0)}
);\n\n"""

# 写入 seed.sql
seed_path = os.path.join(os.path.dirname(__file__), '../seed.sql')
with open(seed_path, 'w', encoding='utf-8') as f:
    f.write(schema_sql + insert_statements)

print("\nGenerated seed.sql")
print(f"File size: {os.path.getsize(seed_path) / 1024 / 1024:.2f} MB")
