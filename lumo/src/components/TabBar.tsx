import { navigate, useRoute } from '../lib/router';
import { haptic } from '../lib/haptics';

const TABS = [
  { to: '/', label: 'Home', d: 'M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1Z' },
  { to: '/reflectr', label: 'Reflectr', d: 'M5 3h11l3 3v15H5Zm3 6h8M8 13h8M8 17h5' },
  { to: '/groundr', label: 'Groundr', d: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z' },
  { to: '/progress', label: 'Progress', d: 'M4 20V10m5 10V5m5 15v-7m5 7V8' },
  { to: '/lessons', label: 'Learn', d: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5Z' },
];

export function TabBar() {
  const { path } = useRoute();
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t) => {
        const active = t.to === '/' ? path === '/' : path.startsWith(t.to);
        return (
          <button
            key={t.to}
            className="tab"
            aria-current={active ? 'page' : undefined}
            onClick={() => {
              haptic('tap');
              navigate(t.to);
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d={t.d}
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
