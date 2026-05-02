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
// Query params:
//   category     - filter by category
//   level        - filter by level
//   parent_id    - filter by parent_id (use "root" for parent_id IS NULL)
//   limit        - pagination limit (default 50, max 200)
//   offset       - pagination offset (default 0)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const category = url.searchParams.get('category') || '';
  const level = url.searchParams.get('level');
  const parentIdParam = url.searchParams.get('parent_id');
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50') || 50, 1), 200);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0') || 0, 0);
  
  let query = 'SELECT * FROM questions WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) as total FROM questions WHERE 1=1';
  const params: unknown[] = [];
  
  if (category) {
    query += ' AND category = ?';
    countQuery += ' AND category = ?';
    params.push(category);
  }
  
  if (level !== null && level !== '') {
    query += ' AND level = ?';
    countQuery += ' AND level = ?';
    params.push(parseInt(level));
  }
  
  if (parentIdParam !== null && parentIdParam !== '') {
    if (parentIdParam === 'root') {
      query += ' AND parent_id IS NULL';
      countQuery += ' AND parent_id IS NULL';
    } else {
      query += ' AND parent_id = ?';
      countQuery += ' AND parent_id = ?';
      params.push(parentIdParam);
    }
  }
  
  query += ' ORDER BY sort_order ASC, created_at ASC';
  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  try {
    // Get total count
    const countResult = await env.DB.prepare(countQuery).bind(...params.slice(0, -2)).first<{total: number}>();
    const total = countResult?.total || 0;
    
    // Get paginated results
    const result = await env.DB.prepare(query).bind(...params).all();
    
    return new Response(JSON.stringify({
      results: result.results,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Database error', details: String(err) }), {
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
