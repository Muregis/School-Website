import { kv } from '@vercel/kv';
import { checkAuth, getContent, setContent, corsHeaders } from '../_utils.js';

export default async function handler(request, response) {
  const cors = corsHeaders();
  
  if (request.method === 'OPTIONS') {
    response.status = 200;
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return response.end();
  }
  
  const authError = await checkAuth(request);
  if (!authError && request.method !== 'GET') {
    response.status = 401;
    response.setHeader('Content-Type', 'application/json');
    return response.end(JSON.stringify({ error: 'Unauthorized' }));
  }
  
  const data = await getContent('content:settings', 'content/settings.json');
  
  if (request.method === 'GET') {
    response.status = 200;
    response.setHeader('Content-Type', 'application/json');
    response.setHeader(cors['Access-Control-Allow-Origin'], cors['Access-Control-Allow-Origin']);
    return response.end(JSON.stringify(data || {}));
  }
  
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const success = await setContent('content:settings', body);
      
      if (success) {
        response.status = 200;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify({ success: true }));
      } else {
        response.status = 500;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify({ error: 'Failed to save. KV may not be configured.' }));
      }
    } catch {
      response.status = 400;
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify({ error: 'Bad request' }));
    }
  }
  
  response.status = 405;
  return response.end(JSON.stringify({ error: 'Method not allowed' }));
}
