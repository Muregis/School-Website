export default async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    response.status = 200;
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return response.end();
  }
  
  if (request.method === 'POST') {
    try {
      const formData = await request.formData();
      const file = formData.get('file');
      
      if (!file) {
        response.status = 400;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify({ error: 'No file uploaded' }));
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      if (buffer.length > 5 * 1024 * 1024) {
        response.status = 400;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify({ error: 'Image too large. Please use images under 5MB.' }));
      }
      
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;
      
      response.status = 200;
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify({ 
        url: dataUrl,
        size: buffer.length,
        type: file.type
      }));
    } catch {
      response.status = 500;
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify({ error: 'Upload failed' }));
    }
  }
  
  response.status = 405;
  return response.end(JSON.stringify({ error: 'Method not allowed' }));
}
