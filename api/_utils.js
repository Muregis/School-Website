let inMemoryStore = new Map();

export function getCookie(request, name) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map(c => c.trim().split('='));
  for (const [key, value] of cookies) {
    if (key === name) return decodeURIComponent(value);
  }
  return null;
}

export async function checkAuth(request) {
  const sessionId = getCookie(request, 'admin_session');
  if (!sessionId) return false;
  
  const mem = inMemoryStore.get(`session:${sessionId}`);
  if (!mem) return false;
  if (Date.now() > mem.expires) {
    inMemoryStore.delete(`session:${sessionId}`);
    return false;
  }
  return true;
}

export async function getContent(key, fallbackPath) {
  const memData = inMemoryStore.get(key);
  if (memData) return JSON.parse(memData);
  
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
  inMemoryStore.set(key, JSON.stringify(value));
  return true;
}
