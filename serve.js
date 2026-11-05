/**
 * 奶蛙远征 · 零依赖局域网服务器
 * 用法：node serve.js  （或双击 启动.bat）
 * 启动后同一 WiFi 下的手机/平板/电脑打开打印出的地址即可玩。
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8080);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon'
};

function lanIPs() {
  const out = [];
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const ni of nets[name] || []) {
      if (ni.family === 'IPv4' && !ni.internal) out.push(ni.address);
    }
  }
  return out;
}

const server = http.createServer((req, res) => {
  let rel = decodeURIComponent((req.url || '/').split('?')[0]);
  if (rel === '/' || rel === '') rel = '/index.html';
  const file = path.join(ROOT, path.normalize(rel).replace(/^(\.\.[\/\\])+/, ''));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('forbidden'); return; }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('404'); return; }
    res.writeHead(200, {
      'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'content-length': st.size,
      'cache-control': 'no-cache'
    });
    fs.createReadStream(file).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = lanIPs();
  console.log('');
  console.log('  奶蛙远征 · 本地服务器已启动');
  console.log('  --------------------------------------------------');
  console.log('  本机打开：  http://localhost:' + PORT);
  if (ips.length) {
    ips.forEach(ip => console.log('  手机/其他设备：http://' + ip + ':' + PORT));
  } else {
    console.log('  没检测到局域网 IP，检查一下 WiFi / 网线');
  }
  console.log('  --------------------------------------------------');
  console.log('  手机和电脑连同一个 WiFi 才能互相访问。');
  console.log('  关掉这个窗口或按 Ctrl+C 结束。');
  console.log('');
});
