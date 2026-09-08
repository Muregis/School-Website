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
    
    const sessionData = { expires: Date.now() + (86400 * 1000) };
    const secret = process.env.ADMIN_PASSWORD || 'admin2026';
    const sessionId = signSession(sessionData, secret);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `admin_session=${sessionId}; Path=/; HttpOnly; Max-Age=86400`,
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
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'admin_session=; Path=/; HttpOnly; Max-Age=0',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

function signSession(data, secret) {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}
