import { useState } from 'react';
import { APP, DISCLAIMER, REGIONS, SETTINGS } from '../content';
import type { RegionCode } from '../content/crisis';
import { statsOf, useStore } from '../store/useStore';
import { exportCheckInsCSV, exportEverythingCSV, printSummary } from '../lib/exporters';
import { askForNotifications, scheduleTodaysInvitation } from '../lib/reminders';
import { navigate } from '../lib/router';
import { BackLink, Button, Card, PageHead } from '../components/ui';

export function Settings() {
  const store = useStore();
  const patch = useStore((s) => s.patchSettings);
  const relock = useStore((s) => s.relock);
  const deleteEverything = useStore((s) => s.deleteEverything);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notifState, setNotifState] = useState<string>('');
  const stats = statsOf(store);

  return (
    <div className="screen">
      <BackLink to="/" />
      <PageHead title={SETTINGS.title} />

      {/* --- reminders --- */}
      <section className="stack">
        <div>
          <h3>{SETTINGS.reminders}</h3>
          <p className="small dim">{SETTINGS.remindersSub}</p>
        </div>
        <div className="row">
          <input
            type="time"
            aria-label="Invitation time"
            value={store.settings.reminderTime ?? '19:00'}
            onChange={(e) => patch({ reminderTime: e.target.value })}
          />
          <Button
            variant="secondary"
            onClick={async () => {
              const ok = await askForNotifications();
              setNotifState(ok ? 'On. One a day, at that time, while Lumo is open.' : 'Your browser said no. Nothing else changes.');
              if (ok) scheduleTodaysInvitation(store.settings.reminderTime ?? '19:00');
            }}
          >
            Allow
          </Button>
        </div>
        {notifState && <p className="tiny dim">{notifState}</p>}
        {store.settings.reminderTime && (
          <Button variant="quiet" block onClick={() => patch({ reminderTime: null })}>
            Turn invitations off
          </Button>
        )}
      </section>

      <hr className="divider" />

      {/* --- appearance --- */}
      <section className="stack">
        <h3>Appearance</h3>
        <div className="row">
          <Button
            variant={store.settings.theme === 'dark' ? 'primary' : 'secondary'}
            onClick={() => patch({ theme: 'dark' })}
          >
            Dark
          </Button>
          <Button
            variant={store.settings.theme === 'light' ? 'primary' : 'secondary'}
            onClick={() => patch({ theme: 'light' })}
          >
            Light
          </Button>
        </div>
        <p className="tiny dim">Dark is the default. A lot of these sessions happen at night.</p>
      </section>

      <hr className="divider" />

      {/* --- region --- */}
      <section className="stack">
        <div>
          <h3>Region and crisis lines</h3>
          <p className="small dim">Sets which numbers the Anchr dials.</p>
        </div>
        <select
          aria-label="Region"
          value={store.settings.region}
          onChange={(e) => patch({ region: e.target.value as RegionCode })}
        >
          {REGIONS.map((r) => (
            <option key={r.code} value={r.code}>
              {r.label}
            </option>
          ))}
        </select>
        <Button variant="secondary" block onClick={() => navigate('/anchr')}>
          Open the Anchr
        </Button>
      </section>

      <hr className="divider" />

      {/* --- lock --- */}
      <section className="stack">
        <div>
          <h3>{SETTINGS.lock}</h3>
          <p className="small dim">{SETTINGS.lockSub}</p>
        </div>
        {store.settings.lockCode ? (
          <Button variant="secondary" block onClick={() => patch({ lockCode: null })}>
            Turn the code off
          </Button>
        ) : (
          <Button variant="secondary" block onClick={() => navigate('/lock/set')}>
            Set a four-digit code
          </Button>
        )}
      </section>

      <hr className="divider" />

      {/* --- data --- */}
      <section className="stack">
        <div>
          <h3>{SETTINGS.export}</h3>
          <p className="small dim">{SETTINGS.exportSub}</p>
        </div>
        <Button variant="secondary" block onClick={() => exportCheckInsCSV(store.checkIns)}>
          Check-ins as CSV
        </Button>
        <Button
          variant="secondary"
          block
          onClick={() => (store.entitlement.fullAccess ? exportEverythingCSV(store) : navigate('/paywall'))}
        >
          Everything as CSV
        </Button>
        <Button
          variant="secondary"
          block
          onClick={() =>
            store.entitlement.fullAccess
              ? printSummary({ name: store.settings.name, ...store })
              : navigate('/paywall')
          }
        >
          One-page clinician summary
        </Button>
      </section>

      <hr className="divider" />

      {/* --- subscription --- */}
      <section className="stack">
        <h3>Full Access</h3>
        <p className="small dim">
          {store.entitlement.fullAccess
            ? `On — ${store.entitlement.plan}. This demo unlock is local to this device.`
            : 'Not on. The free tools stay free either way.'}
        </p>
        {store.entitlement.fullAccess ? (
          <Button variant="secondary" block onClick={relock}>
            Turn the demo unlock off
          </Button>
        ) : (
          <Button variant="secondary" block onClick={() => navigate('/paywall')}>
            See what is in it
          </Button>
        )}
      </section>

      <hr className="divider" />

      {/* --- danger --- */}
      <section className="stack">
        <div>
          <h3>{SETTINGS.deleteAll}</h3>
          <p className="small dim">{SETTINGS.deleteSub}</p>
        </div>
        {confirmDelete ? (
          <>
            <p className="small">{SETTINGS.deleteConfirm}</p>
            <Button
              variant="safety"
              block
              onClick={() => {
                deleteEverything();
                setConfirmDelete(false);
                navigate('/');
              }}
            >
              Yes, delete everything
            </Button>
            <Button variant="quiet" block onClick={() => setConfirmDelete(false)}>
              Keep it
            </Button>
          </>
        ) : (
          <Button variant="safety-quiet" block onClick={() => setConfirmDelete(true)}>
            Delete everything
          </Button>
        )}
      </section>

      <hr className="divider" />

      <section className="stack">
        <h3>About</h3>
        <Card flat>
          <p className="small dim">{DISCLAIMER.settings}</p>
        </Card>
        <p className="tiny dim">
          {APP.name} — {APP.subtitle}. {stats.daysOpened} days opened. All data on this device, nothing on a server.
        </p>
      </section>
    </div>
  );
}
