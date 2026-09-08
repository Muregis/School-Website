import crypto from 'crypto';

function signSession(data, secret) {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifySession(token, secret) {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    if (signature !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (Date.now() > data.expires) return null;
    return data;
  } catch {
    return null;
  }
}

export function getCookie(request, name) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map(c => c.trim().split('='));
  for (const [key, value] of cookies) {
    if (key === name) return decodeURIComponent(value);
  }
  return null;
}

export function checkAuth(request) {
  const sessionId = getCookie(request, 'admin_session');
  if (!sessionId) return false;
  
  const secret = process.env.ADMIN_PASSWORD || 'admin2026';
  const session = verifySession(sessionId, secret);
  return !!session;
}

export async function getContent(key, fallbackPath) {
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

const contentPaths = {
  'content:settings': 'content/settings.json',
  'content:team': 'content/team/_index.json',
  'content:news': 'content/news/_index.json',
  'content:gallery': 'content/gallery/_index.json',
  'content:events': 'content/events/term-dates.json',
};

export async function setContent(key, value) {
  const fallbackPath = contentPaths[key];
  if (!fallbackPath) return false;
  
  try {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), fallbackPath);
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
    return true;
  } catch {
    return false;
  }
}
