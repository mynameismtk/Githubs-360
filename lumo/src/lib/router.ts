/**
 * A very small hash router.
 * Hash routing means the built app can be opened from a file, a static host or
 * a subfolder with no server rewrites — which matters for an offline-first app.
 */

import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();

function currentPath(): string {
  const h = window.location.hash.replace(/^#/, '');
  return h.startsWith('/') ? h : '/';
}

let path = typeof window === 'undefined' ? '/' : currentPath();

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    path = currentPath();
    listeners.forEach((l) => l());
  });
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useRoute() {
  const p = useSyncExternalStore(
    subscribe,
    () => path,
    () => '/',
  );
  return { path: p, segments: p.split('/').filter(Boolean) };
}

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  const target = `#${to.startsWith('/') ? to : `/${to}`}`;
  if (window.location.hash === target) return;
  if (opts.replace) {
    window.history.replaceState(null, '', target);
    path = currentPath();
    listeners.forEach((l) => l());
  } else {
    window.location.hash = target;
  }
  window.scrollTo({ top: 0 });
}

export function back(fallback = '/') {
  if (window.history.length > 1) window.history.back();
  else navigate(fallback);
}
