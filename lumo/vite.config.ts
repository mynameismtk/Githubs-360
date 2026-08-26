import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Emits a service worker whose precache list is the real, hashed build output.
 * Without this the app opens offline but renders nothing, because the bundle
 * was never cached — and "works in airplane mode" is a requirement here, not a
 * nice-to-have.
 */
function serviceWorker(): Plugin {
  return {
    name: 'lumo-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const emitted = Object.keys(bundle)
        .filter((f) => !f.endsWith('.map'))
        .map((f) => `./${f}`);
      const precache = ['./', './index.html', './manifest.webmanifest', './icon.svg', ...emitted];
      const template = readFileSync(new URL('./sw.template.js', import.meta.url), 'utf8');
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: template
          .replace('__CACHE__', `lumo-${Date.now().toString(36)}`)
          .replace('__PRECACHE__', JSON.stringify(precache, null, 2)),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), serviceWorker()],
  base: './',
  build: { outDir: 'dist', sourcemap: false },
});
