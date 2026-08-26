/**
 * The escalation card.
 *
 * Shown when the last two check-ins were both at the lowest mood, or when the
 * user taps "I'm not safe right now". It is calm, it is dismissible, it never
 * locks the app, and it never appears more than once in twelve hours.
 * Nothing is reported anywhere — there is nowhere for it to be reported to.
 */

import { NOT_SAFE_CARD, SAFETY_CARD } from '../content/copy';
import { regionByCode, type RegionCode } from '../content/crisis';
import { navigate } from '../lib/router';
import { Button, Sheet } from './ui';
import { Mo } from './Mo';

export function SafetyCard({
  region,
  variant = 'run',
  onSit,
  onClose,
}: {
  region: RegionCode;
  variant?: 'run' | 'not-safe';
  onSit?: () => void;
  onClose: () => void;
}) {
  const r = regionByCode(region);
  const first = r.lines[0];
  const copy = variant === 'run' ? SAFETY_CARD : { ...SAFETY_CARD, ...NOT_SAFE_CARD };

  return (
    <Sheet onClose={onClose} labelledBy="safety-title">
      <div className="stack">
        <div className="row">
          <Mo mood="listening" size={64} />
          <h3 id="safety-title" className="grow">
            {copy.title}
          </h3>
        </div>
        <p className="dim">{copy.body}</p>

        {first && (
          <a
            className="btn btn--safety btn--block"
            href={first.dial ? `tel:${first.dial}` : (first.url ?? '#')}
            target={first.url ? '_blank' : undefined}
            rel="noreferrer"
          >
            {first.dial ? `Call ${first.name} — ${first.display}` : `Open ${first.name}`}
          </a>
        )}

        <Button
          variant="secondary"
          block
          onClick={() => {
            onClose();
            navigate('/anchr');
          }}
        >
          {SAFETY_CARD.optionPlan}
        </Button>

        {onSit && (
          <Button variant="secondary" block onClick={onSit}>
            {SAFETY_CARD.optionSit}
          </Button>
        )}

        <Button variant="quiet" block onClick={onClose}>
          {SAFETY_CARD.dismiss}
        </Button>
      </div>
    </Sheet>
  );
}
