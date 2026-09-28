const http = require('http');
const fs = require('fs');
const path = require('path');

const VIDEO_PATH = path.join(
  'C:', 'Users', 'Pream Kumar', '.gemini', 'antigravity-ide', 'brain',
  '17dc2189-c280-4179-ab30-40fd5b1aa9cf',
  'creatorly_redesign_check_1790626188630.webp'
);

const HTML_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Creatorly Demo</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#09090b;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;font-family:system-ui,sans-serif}
.header{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.badge{width:32px;height:32px;background:linear-gradient(135deg,#0d9488,#0f766e);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;color:#fff}
.title{font-size:18px;font-weight:700;color:#fff;letter-spacing:-.3px}
.sub{font-size:13px;color:#71717a;margin-bottom:20px}
.wrap{width:100%;max-width:1100px;border-radius:14px;overflow:hidden;border:1px solid #27272a;background:#18181b}
.bar{background:#18181b;padding:8px 14px;display:flex;align-items:center;gap:7px;border-bottom:1px solid #27272a}
.dot{width:11px;height:11px;border-radius:50%}
.r{background:#ef4444}.y{background:#eab308}.g{background:#22c55e}
.url{flex:1;background:#09090b;border:1px solid #27272a;border-radius:5px;padding:3px 10px;font-size:11px;color:#52525b;font-family:monospace;margin-left:8px}
img{width:100%;display:block}
.tag{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:600;border:1px solid #134e4a;background:rgba(13,148,136,.08);color:#2dd4bf;margin-top:16px}
</style>
</head>
<body>
<div class="header"><div class="badge">Cr</div><span class="title">Creatorly</span></div>
<p class="sub">Full Product Demo — All 8 Pages</p>
<div class="wrap">
<div class="bar">
<div class="dot r"></div><div class="dot y"></div><div class="dot g"></div>
<div class="url">localhost:3001 — Creatorly Demo Walkthrough</div>
</div>
<img src="/video" alt="Creatorly Demo">
</div>
<div class="tag">Live animated recording</div>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/video') {
    const stat = fs.statSync(VIDEO_PATH);
    res.writeHead(200, {
      'Content-Type': 'image/webp',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(VIDEO_PATH).pipe(res);
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(HTML_PAGE);
});

server.listen(4321, () => {
  console.log('Demo player ready at http://localhost:4321');
});
