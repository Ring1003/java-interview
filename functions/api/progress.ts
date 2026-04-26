import type { EventContext } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: corsHeaders });
};

// POST /api/progress - Update progress
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Check if it's a stats request with path parameter
  const pathParts = url.pathname.split('/').filter(Boolean);
  if (pathParts.length > 3 && pathParts[3] === 'stats') {
    return getStats(context.env, pathParts[2]);
  }
  
  try {
    const body = await request.json() as { device_id?: string; question_id?: string; status?: string };
    const { device_id, question_id, status } = body;
    
    if (!device_id || !question_id || !status) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Validate status
    const validStatuses = ['unread', 'mastered', 'reviewing'];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    await env.DB.prepare(`
      INSERT INTO device_progress (device_id, question_id, status, accessed_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(device_id, question_id) DO UPDATE SET
        status = excluded.status,
        updated_at = datetime('now')
    `).bind(device_id, question_id, status).run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

// GET /api/progress/:deviceId
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  // /api/progress/:deviceId/stats
  if (pathParts.length > 3 && pathParts[3] === 'stats') {
    return getStats(context.env, pathParts[2]);
  }
  
  // /api/progress/:deviceId
  const deviceId = pathParts[2] || url.searchParams.get('deviceId');
  
  if (!deviceId) {
    return new Response(JSON.stringify({ error: 'Missing deviceId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
  
  try {
    const result = await context.env.DB.prepare(
      'SELECT * FROM device_progress WHERE device_id = ?'
    ).bind(deviceId).all();
    
    // Convert to record
    const progress: Record<string, string> = {};
    result.results.forEach((row) => {
      const r = row as { question_id: string; status: string };
      progress[r.question_id] = r.status;
    });
    
    return new Response(JSON.stringify(progress), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

// Helper function to get stats
async function getStats(env: Env, deviceId: string): Promise<Response> {
  try {
    const totalResult = await env.DB.prepare('SELECT COUNT(*) as count FROM questions').first() as { count: number };
    const progressResult = await env.DB.prepare(
      'SELECT status, COUNT(*) as count FROM device_progress WHERE device_id = ? GROUP BY status'
    ).bind(deviceId).all() as { results: Array<{ status: string; count: number }> };
    
    const stats = {
      total: totalResult.count,
      mastered: 0,
      reviewing: 0,
      unread: totalResult.count
    };
    
    progressResult.results.forEach((row) => {
      if (row.status === 'mastered') stats.mastered = row.count;
      if (row.status === 'reviewing') stats.reviewing = row.count;
    });
    
    stats.unread = stats.total - stats.mastered - stats.reviewing;
    
    return new Response(JSON.stringify(stats), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
