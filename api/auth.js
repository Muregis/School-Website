import { kv } from '@vercel/kv';
import { checkAuth, getCookie, corsHeaders } from '../_utils.js';

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
        await kv.set(`session:${sessionId}`, 'active', { ex: 86400 });
        
        response.setHeader('Set-Cookie', `admin_session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
        response.status = 200;
        response.setHeader('Content-Type', 'application/json');
        response.setHeader(cors['Access-Control-Allow-Origin'], cors['Access-Control-Allow-Origin']);
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
      await kv.del(`session:${sessionId}`);
    }
    response.setHeader('Set-Cookie', 'admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
    response.status = 200;
    response.setHeader('Content-Type', 'application/json');
    return response.end(JSON.stringify({ success: true }));
  }
  
  response.status = 405;
  return response.end(JSON.stringify({ error: 'Method not allowed' }));
}
