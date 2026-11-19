import os
import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

class CustomHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable cache during development so images and scripts never stale
        self.send_header('Access-Control-Allow-Origin', '*')
        if self.path.endswith(('.html', '.js', '.css', '.json')):
            self.send_header('Cache-Control', 'no-cache, must-revalidate')
        else:
            self.send_header('Cache-Control', 'public, max-age=3600')
        super().end_headers()

    def guess_type(self, path):
        if path.endswith('.svg'):
            return 'image/svg+xml'
        if path.endswith('.jpeg') or path.endswith('.jpg'):
            return 'image/jpeg'
        if path.endswith('.js'):
            return 'application/javascript; charset=utf-8'
        if path.endswith('.css'):
            return 'text/css; charset=utf-8'
        if path.endswith('.json'):
            return 'application/json; charset=utf-8'
        return super().guess_type(path)

    def log_message(self, format, *args):
        # Suppress spammy log output
        pass

if __name__ == '__main__':
    port = 3000
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = ThreadingHTTPServer(('0.0.0.0', port), CustomHandler)
    print(f"Serving HTTP on 0.0.0.0 port {port} (multi-threaded)...")
    server.serve_forever()
