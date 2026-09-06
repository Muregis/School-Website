import { checkAuth, getCookie, corsHeaders, inMemoryStore, getKV } from '../_utils.js';

export default async function handler(request, response) {
  const cors = corsHeaders();
  
  if (request.method === 'OPTIONS') {
    response.status = 200;
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return response.end();
  }
  
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { password } = body;
      
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin2026';
      
      if (password === adminPassword) {
        const sessionId = crypto.randomUUID();
        const expiresAt = Date.now() + (86400 * 1000);
        
        try {
          const kv = await getKV();
          if (kv) {
            await kv.set(`session:${sessionId}`, 'active', { ex: 86400 });
          } else {
            inMemoryStore.set(`session:${sessionId}`, { expires: expiresAt });
          }
        } catch {
          inMemoryStore.set(`session:${sessionId}`, { expires: expiresAt });
        }
        
        response.setHeader('Set-Cookie', `admin_session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
        response.status = 200;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify({ success: true }));
      } else {
        response.status = 401;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify({ error: 'Invalid password' }));
      }
    } catch {
      response.status = 400;
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify({ error: 'Bad request' }));
    }
  }
  
  if (request.method === 'GET') {
    const authorized = await checkAuth(request);
    response.status = authorized ? 200 : 401;
    response.setHeader('Content-Type', 'application/json');
    return response.end(JSON.stringify({ authenticated: authorized }));
  }
  
  if (request.method === 'DELETE') {
    const sessionId = getCookie(request, 'admin_session');
    if (sessionId) {
      try {
        const kv = await getKV();
        if (kv) {
          await kv.del(`session:${sessionId}`);
        }
      } catch {}
      inMemoryStore.delete(`session:${sessionId}`);
    }
    response.setHeader('Set-Cookie', 'admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
    response.status = 200;
    response.setHeader('Content-Type', 'application/json');
    return response.end(JSON.stringify({ success: true }));
  }
  
  response.status = 405;
  return response.end(JSON.stringify({ error: 'Method not allowed' }));
}
