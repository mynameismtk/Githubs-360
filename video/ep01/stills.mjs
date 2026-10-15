// node stills.mjs <composition> <frame,frame,...>  -> out/stills/<comp>-<frame>.png from one bundle + one browser
import {bundle} from '@remotion/bundler';
import {openBrowser, selectComposition, renderStill} from '@remotion/renderer';
import path from 'node:path';
const [id, frames] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', {browserExecutable: process.env.REMOTION_CHROME});
const composition = await selectComposition({serveUrl, id, puppeteerInstance: browser});
for (const f of frames.split(',').map(Number)) {
  await renderStill({serveUrl, composition, frame: f, output: `out/stills/${id}-${f}.png`, puppeteerInstance: browser});
}
await browser.close({silent: true});
console.log('done', frames);
