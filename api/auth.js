export async function GET(request) {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body || {};
    
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin2026';
    
    if (!password || password !== adminPassword) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
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
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(JSON.stringify({ error: 'Server error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function DELETE(request) {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
