import type { EventContext } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS for CORS
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: corsHeaders });
};

// GET /api/questions
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const category = url.searchParams.get('category') || '';
  const level = url.searchParams.get('level');
  const parentId = url.searchParams.get('parent_id');
  
  let query = 'SELECT * FROM questions WHERE 1=1';
  const params: unknown[] = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  if (level !== null) {
    query += ' AND level = ?';
    params.push(parseInt(level));
  }
  
  if (parentId) {
    query += ' AND parent_id = ?';
    params.push(parentId);
  } else if (parentId === null && level === '0') {
    query += ' AND parent_id IS NULL';
  }
  
  query += ' ORDER BY sort_order ASC, created_at ASC';
  
  try {
    const result = await env.DB.prepare(query).bind(...params).all();
    return new Response(JSON.stringify(result.results), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

// POST /api/questions (for seeding)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const questions = Array.isArray(body) ? body : [body];
    
    const stmt = env.DB.prepare(`
      INSERT OR REPLACE INTO questions (id, category, level, parent_id, title, answer, tags, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const batch = questions.map((q: { id: string; category: string; level: number; parent_id?: string; title: string; answer: string; tags?: string; sort_order?: number }) => 
      stmt.bind(q.id, q.category, q.level, q.parent_id || null, q.title, q.answer, q.tags || '', q.sort_order || 0)
    );
    
    await env.DB.batch(batch);
    
    return new Response(JSON.stringify({ success: true, count: questions.length }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};
