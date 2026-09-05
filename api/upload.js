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
      
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
      
      if (!cloudName || !uploadPreset) {
        response.status = 500;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify({ error: 'Cloudinary not configured on server' }));
      }
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const FormData = (await import('form-data')).default;
      const cloudinaryForm = new FormData();
      cloudinaryForm.append('file', buffer, { filename: file.name, contentType: file.type });
      cloudinaryForm.append('upload_preset', uploadPreset);
      
      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: cloudinaryForm,
      });
      
      if (!cloudinaryRes.ok) {
        const errorText = await cloudinaryRes.text();
        response.status = 500;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify({ error: 'Upload failed', details: errorText }));
      }
      
      const result = await cloudinaryRes.json();
      response.status = 200;
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify({ 
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
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
