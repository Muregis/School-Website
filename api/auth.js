export default async function handler(request) {
  try {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    if (request.method === 'POST') {
      let body = {};
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      const password = body && typeof body === 'object' ? body.password : undefined;
      
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin2026';
      
      if (!password || password !== adminPassword) {
        return new Response(JSON.stringify({ error: 'Invalid password' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      const sessionId = Date.now().toString() + '-' + Math.random().toString(36).substring(2);
      
      return new Response(JSON.stringify({ success: true, sessionId }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `admin_session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(JSON.stringify({ 
      error: 'Server error',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
