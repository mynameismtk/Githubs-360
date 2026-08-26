/**
 * MO — the mascot.
 * A small rounded lamp-creature with a warm glow in its chest. The glow
 * brightens with engagement. Six expressions, no more.
 *
 * Mo never nags, never looks disappointed and never guilt-trips.
 */

export type MoMood = 'sleepy' | 'listening' | 'warm' | 'proud' | 'resting' | 'glowing';

const GLOW: Record<MoMood, number> = {
  resting: 0.22,
  sleepy: 0.34,
  listening: 0.52,
  warm: 0.68,
  proud: 0.86,
  glowing: 1,
};

function Eyes({ mood }: { mood: MoMood }) {
  const stroke = 'var(--bg-base)';
  const common = { stroke, strokeWidth: 4.4, strokeLinecap: 'round' as const, fill: 'none' };
  switch (mood) {
    case 'resting':
      return (
        <>
          <path d="M41 62 h11" {...common} />
          <path d="M68 62 h11" {...common} />
        </>
      );
    case 'sleepy':
      return (
        <>
          <path d="M41 60 q5.5 6 11 0" {...common} />
          <path d="M68 60 q5.5 6 11 0" {...common} />
        </>
      );
    case 'warm':
    case 'proud':
      return (
        <>
          <path d="M41 63 q5.5 -7 11 0" {...common} />
          <path d="M68 63 q5.5 -7 11 0" {...common} />
        </>
      );
    default:
      return (
        <>
          <circle cx="46.5" cy="61" r="3.6" fill={stroke} />
          <circle cx="73.5" cy="61" r="3.6" fill={stroke} />
        </>
      );
  }
}

function Mouth({ mood }: { mood: MoMood }) {
  const common = {
    stroke: 'var(--bg-base)',
    strokeWidth: 4,
    strokeLinecap: 'round' as const,
    fill: 'none',
    opacity: 0.85,
  };
  if (mood === 'resting') return null;
  if (mood === 'proud') return <path d="M52 74 q8 8 16 0" {...common} />;
  if (mood === 'warm' || mood === 'glowing') return <path d="M54 74 q6 5 12 0" {...common} />;
  return <path d="M56 74 h8" {...common} />;
}

export function Mo({
  mood = 'listening',
  size = 132,
  animate = true,
  label,
}: {
  mood?: MoMood;
  size?: number;
  animate?: boolean;
  label?: string;
}) {
  const glow = GLOW[mood];
  return (
    <div
      className={`mo ${animate ? 'mo--breathing' : ''}`}
      style={{ width: size, height: size, ['--mo-glow' as string]: glow }}
      role="img"
      aria-label={label ?? `Mo looks ${mood}`}
    >
      <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
        <defs>
          <radialGradient id="mo-chest" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#FFF3DF" />
            <stop offset="45%" stopColor="var(--amber-core)" />
            <stop offset="100%" stopColor="var(--amber-deep)" stopOpacity="0.15" />
          </radialGradient>
          <linearGradient id="mo-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--amber-core)" />
            <stop offset="100%" stopColor="var(--amber-deep)" />
          </linearGradient>
        </defs>

        {/* lamp shade */}
        <circle cx="60" cy="15" r="4.2" fill="var(--clay)" />
        <path d="M60 19 v5" stroke="var(--clay)" strokeWidth="3" />
        <path
          d="M44 24 h32 a3 3 0 0 1 2.8 2 l7.4 15.5 a2.4 2.4 0 0 1 -2.2 3.5 h-47.9 a2.4 2.4 0 0 1 -2.2 -3.5 l7.4 -15.5 a3 3 0 0 1 2.8 -2 Z"
          fill="var(--clay)"
        />

        {/* body */}
        <path
          d="M60 46
             C88 46 98 62 98 80
             C98 99 82 108 60 108
             C38 108 22 99 22 80
             C22 62 32 46 60 46 Z"
          fill="url(#mo-body)"
        />

        {/* chest glow */}
        <circle className="mo__chest" cx="60" cy="88" r="15" fill="url(#mo-chest)" />

        <Eyes mood={mood} />
        <Mouth mood={mood} />

        {/* feet */}
        <ellipse cx="45" cy="110" rx="8" ry="4" fill="var(--amber-deep)" />
        <ellipse cx="75" cy="110" rx="8" ry="4" fill="var(--amber-deep)" />
      </svg>
    </div>
  );
}
