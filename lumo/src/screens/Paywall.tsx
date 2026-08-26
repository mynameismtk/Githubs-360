/**
 * PAYWALL
 *
 * Rules, enforced here and at every call site:
 *  - the Liftr, the Anchr, check-ins, reframes and every crisis feature are
 *    never behind it
 *  - it cannot appear during or after a comfort session, or after a low-mood
 *    check-in — see `paywallAllowed`
 *  - "Not now" is always the easiest button to hit
 *
 * This build is a demo: unlocking is local and reversible. Wiring it to
 * RevenueCat in the native build is described in the README.
 */

import { PAYWALL } from '../content';
import { paywallAllowed, useStore } from '../store/useStore';
import { back, navigate } from '../lib/router';
import { haptic } from '../lib/haptics';
import { Button, Card, PageHead } from '../components/ui';
import { Mo } from '../components/Mo';

const PLANS = [
  { id: 'monthly', title: PAYWALL.monthly, price: '£4.99', per: 'a month', note: '' },
  { id: 'yearly', title: PAYWALL.yearly, price: '£29.99', per: 'a year', note: `${PAYWALL.trial} £29.99` },
  { id: 'lifetime', title: PAYWALL.lifetime, price: '£79.99', per: 'once, forever', note: 'No subscription' },
] as const;

export function Paywall() {
  const store = useStore();
  const unlock = useStore((s) => s.unlock);

  if (store.entitlement.fullAccess) {
    return (
      <div className="screen">
        <PageHead title="Full Access is on" sub={`Plan: ${store.entitlement.plan}.`} onBack={() => back('/lessons')} />
        <Card flat>
          <p className="small dim">Everything is unlocked. You can turn this back off in Settings at any time.</p>
        </Card>
      </div>
    );
  }

  // Quiet window: no pricing is shown at all after a low check-in or a comfort session.
  if (!paywallAllowed(store)) {
    return (
      <div className="screen">
        <PageHead title="Not now" onBack={() => back('/')} />
        <div className="center stack" style={{ alignItems: 'center', marginTop: 'var(--s-8)' }}>
          <Mo mood="warm" size={110} />
          <p className="serif" style={{ fontSize: 'var(--t-22)', maxWidth: '24ch' }}>
            Nothing is for sale right now.
          </p>
          <p className="dim small" style={{ maxWidth: '30ch' }}>
            The tools you have are free and they stay free. Come back to this another time.
          </p>
          <Button block onClick={() => navigate('/')}>
            Back to home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <PageHead title={PAYWALL.title} sub={PAYWALL.sub} onBack={() => back('/lessons')} />

      <Card flat>
        <p className="small">{PAYWALL.reassure}</p>
      </Card>

      <div style={{ height: 'var(--s-5)' }} />

      <div className="stack stack--tight">
        <p className="small dim">What is included</p>
        <ul className="prose" style={{ paddingLeft: '1.15em' }}>
          <li>Getting moving — 12 lessons on behavioural activation, rumination and sleep</li>
          <li>Staying well — 18 lessons on relapse signatures and maintaining gains</li>
          <li>The full soundscape and visualisation library</li>
          <li>Full data export, and a one-page summary you can hand to a clinician</li>
        </ul>
      </div>

      <div style={{ height: 'var(--s-5)' }} />

      <div className="stack">
        {PLANS.map((p) => (
          <Card key={p.id}>
            <div className="row row--between">
              <div>
                <div style={{ fontWeight: 600 }}>{p.title}</div>
                <div className="small dim">
                  {p.price} {p.per}
                  {p.note ? ` · ${p.note}` : ''}
                </div>
              </div>
              <Button
                onClick={() => {
                  haptic('complete');
                  unlock(p.id);
                  navigate('/lessons');
                }}
              >
                {p.id === 'lifetime' ? PAYWALL.ctaLifetime : PAYWALL.cta}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ height: 'var(--s-5)' }} />
      <p className="tiny dim">{PAYWALL.demoNote}</p>
      <div style={{ height: 'var(--s-4)' }} />
      <Button variant="quiet" block onClick={() => back('/')}>
        {PAYWALL.later}
      </Button>
    </div>
  );
}
