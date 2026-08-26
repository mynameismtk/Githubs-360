import { useEffect, useRef, useState } from 'react';
import { navigate } from '../lib/router';
import { haptic } from '../lib/haptics';
import { ANCHR } from '../content/copy';

/**
 * The Anchr is reachable in one tap from anywhere, including from inside the
 * Liftr. It is never hidden behind a menu and never behind a paywall.
 */
export function AnchrFab({ inFlow = false }: { inFlow?: boolean }) {
  /* Shrinks to the anchor alone while the page is being scrolled, so it never
     sits on top of a paragraph someone is reading. It never disappears. */
  const [compact, setCompact] = useState(false);
  const t = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setCompact(true);
      if (t.current) window.clearTimeout(t.current);
      t.current = window.setTimeout(() => setCompact(false), 900);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (t.current) window.clearTimeout(t.current);
    };
  }, []);

  return (
    <button
      className={`anchr-fab${inFlow ? ' anchr-fab--flow' : ''}${compact ? ' anchr-fab--compact' : ''}`}
      onClick={() => {
        haptic('soft');
        navigate('/anchr');
      }}
      aria-label="Open the Anchr — your safety plan and crisis lines"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 7v14M12 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5 13a7 7 0 0 0 14 0M8 10H4m16 0h-4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      <span className="anchr-fab__label">{ANCHR.quick}</span>
    </button>
  );
}
