let inMemoryStore = new Map();
let kvAvailable = null;

async function getKV() {
  if (kvAvailable === null) {
    try {
      const mod = await import('@vercel/kv');
      kvAvailable = mod.kv;
      return mod.kv;
    } catch {
      kvAvailable = false;
      return null;
    }
  }
  return kvAvailable || null;
}

export async function checkAuth(request) {
  const sessionId = getCookie(request, 'admin_session');
  if (!sessionId) return false;
  
  try {
    const kv = await getKV();
    if (kv) {
      const session = await kv.get(`session:${sessionId}`);
      return !!session;
    }
  } catch {}
  
  const mem = inMemoryStore.get(`session:${sessionId}`);
  if (!mem) return false;
  if (Date.now() > mem.expires) {
    inMemoryStore.delete(`session:${sessionId}`);
    return false;
  }
  return true;
}

export async function requireAuth(request, response) {
  const authorized = await checkAuth(request);
  if (!authorized) {
    response.status = 401;
    return { error: 'Unauthorized' };
  }
  return null;
}

export async function getContent(key, fallbackPath) {
  try {
    const kv = await getKV();
    if (kv) {
      const data = await kv.get(key);
      if (data) return data;
    }
  } catch {}
  
  try {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), fallbackPath);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function setContent(key, value) {
  try {
    const kv = await getKV();
    if (kv) {
      await kv.set(key, JSON.stringify(value));
      return true;
    }
  } catch {}
  
  inMemoryStore.set(key, JSON.stringify(value));
  return true;
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export { inMemoryStore, getKV };
