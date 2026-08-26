import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { haptic } from '../lib/haptics';
import { back } from '../lib/router';

export function Button({
  children,
  onClick,
  variant = 'primary',
  block,
  disabled,
  type = 'button',
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'quiet' | 'safety' | 'safety-quiet' | 'sage';
  block?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  ariaLabel?: string;
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant}${block ? ' btn--block' : ''}`}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={
        onClick &&
        (() => {
          haptic('tap');
          onClick();
        })
      }
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  onClick,
  className = '',
  flat,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  flat?: boolean;
  ariaLabel?: string;
}) {
  const cls = `card${flat ? ' card--flat' : ''} ${className}`;
  if (!onClick) return <div className={cls}>{children}</div>;
  return (
    <button
      type="button"
      className={`${cls} card--tap`}
      aria-label={ariaLabel}
      onClick={() => {
        haptic('tap');
        onClick();
      }}
    >
      {children}
    </button>
  );
}

export function PageHead({ title, sub, onBack }: { title: string; sub?: string; onBack?: () => void }) {
  return (
    <header className="pagehead">
      {onBack !== undefined && (
        <button className="backbtn" onClick={onBack} aria-label="Go back">
          <span aria-hidden="true">←</span> Back
        </button>
      )}
      <h1>{title}</h1>
      {sub && <p className="dim small">{sub}</p>}
    </header>
  );
}

export function BackLink({ to }: { to?: string }) {
  return (
    <button className="backbtn" onClick={() => back(to)} aria-label="Go back">
      <span aria-hidden="true">←</span> Back
    </button>
  );
}

export function Sheet({
  children,
  onClose,
  labelledBy,
}: {
  children: ReactNode;
  onClose: () => void;
  labelledBy?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    ref.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  /* Portalled to the body: the screen underneath is animated, which makes it a
     stacking context, which would otherwise trap the sheet under the tab bar. */
  return createPortal(
    <div className="overlay" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__grab" aria-hidden="true" />
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function Chip({
  label,
  on,
  onToggle,
  disabled,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="chip"
      aria-pressed={on}
      disabled={disabled}
      onClick={() => {
        haptic('tap');
        onToggle();
      }}
    >
      {label}
    </button>
  );
}

export function DotRow({
  value,
  onChange,
  labels,
  name,
}: {
  value: number | null;
  onChange: (v: number) => void;
  labels: readonly string[];
  name: string;
}) {
  return (
    <div className="dotrow" role="group" aria-label={name}>
      {labels.map((label, i) => {
        const v = i + 1;
        return (
          <button
            key={label}
            type="button"
            className="dot"
            aria-pressed={value === v}
            aria-label={`${name}: ${label}`}
            onClick={() => {
              haptic('soft');
              onChange(v);
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function Stat({ n, label }: { n: string | number; label: string }) {
  return (
    <div className="stat">
      <div className="stat__n">{n}</div>
      <div className="stat__l">{label}</div>
    </div>
  );
}

export function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div
      className="meter"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
    >
      <div className="meter__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="card card--flat center" style={{ padding: 'var(--s-8) var(--s-5)' }}>
      <p className="dim">{children}</p>
    </div>
  );
}
