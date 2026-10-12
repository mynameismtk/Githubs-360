// Renders index.html frame-by-frame. Every frame is render(t) on a fixed clock, so output is
// deterministic and independent of machine speed.
//
//   node render.mjs sheet 2.3 4.6 ...         -> out/sheet/f_<t>.png
//   node render.mjs video [fps=60] [sub=2]    -> out/video_silent.mp4 (sub-frame motion blur)
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const out = path.join(here, 'out');
const TYPES = { '.html': 'text/html', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.otf': 'font/otf', '.json': 'application/json' };

const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({
  executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none'],
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('page error:', e.message));
await page.goto(`http://localhost:${port}/video/index.html`);
await page.evaluate(() => window.ready);
const cdp = await page.context().newCDPSession(page);

async function frame(t) {
  await page.evaluate((t) => window.render(t), t);
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
  return Buffer.from(data, 'base64');
}

const [mode, ...rest] = process.argv.slice(2);
if (mode === 'sheet') {
  fs.mkdirSync(path.join(out, 'sheet'), { recursive: true });
  for (const s of rest) fs.writeFileSync(path.join(out, 'sheet', `f_${(+s).toFixed(3)}.png`), await frame(+s));
} else if (mode === 'video') {
  const fps = +(rest[0] || 60), sub = +(rest[1] || 2), dur = await page.evaluate(() => window.DUR);
  const n = Math.round(dur * fps * sub);
  const vf = sub > 1 ? `tmix=frames=${sub},framestep=${sub}` : 'null';
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps * sub), '-c:v', 'png', '-i', '-',
    '-vf', `${vf},format=yuv420p`, '-r', String(fps), '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-tune', 'animation', '-movflags', '+faststart',
    path.join(out, 'video_silent.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const buf = await frame(i / (fps * sub));
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 120 === 0) console.log(`frame ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
}
await browser.close(); server.close();
