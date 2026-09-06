import { checkAuth, getContent, setContent, corsHeaders } from '../../_utils.js';

export default async function handler(request, response) {
  const cors = corsHeaders();
  
  if (request.method === 'OPTIONS') {
    response.status = 200;
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return response.end();
  }
  
  if (request.method === 'GET') {
    const data = await getContent('content:team', 'content/team/_index.json');
    response.status = 200;
    response.setHeader('Content-Type', 'application/json');
    response.setHeader(cors['Access-Control-Allow-Origin'], cors['Access-Control-Allow-Origin']);
    return response.end(JSON.stringify(data || []));
  }
  
  if (request.method === 'POST') {
    const authorized = await checkAuth(request);
    if (!authorized) {
      response.status = 401;
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify({ error: 'Unauthorized' }));
    }
    
    try {
      const body = await request.json();
      const success = await setContent('content:team', body);
      
      if (success) {
        response.status = 200;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify({ success: true }));
      } else {
        response.status = 500;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify({ error: 'Failed to save.' }));
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
