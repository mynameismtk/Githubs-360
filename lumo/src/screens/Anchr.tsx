/**
 * THE ANCHR — safety plan, emergency contact, crisis lines.
 *
 * Non-negotiables enforced here:
 *  - stored locally only, never sent anywhere, never behind a paywall
 *  - reachable in one tap from every screen via the floating Safety button
 *  - one-tap call or message to a chosen person, and one-tap dial to a crisis line
 *  - region-aware numbers, shipped with the app so they work with no signal
 */

import { useState } from 'react';
import { ANCHR } from '../content';
import { useStore } from '../store/useStore';
import { uid } from '../lib/storage';
import { navigate, back } from '../lib/router';
import { CrisisLines } from '../components/CrisisLines';
import { BackLink, Button, Card, Meter, PageHead } from '../components/ui';
import type { Contact } from '../store/types';

type ListKey = 'warnings' | 'helped' | 'reasons';
type ContactKey = 'message' | 'call' | 'professionals';

function ListEditor({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState('');
  return (
    <div className="stack stack--tight">
      {items.map((item, i) => (
        <div className="listitem" key={`${item}-${i}`}>
          <span className="grow small">{item}</span>
          <button
            className="btn btn--quiet"
            aria-label={`Remove: ${item}`}
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            Remove
          </button>
        </div>
      ))}
      <div className="row">
        <input
          value={draft}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && draft.trim()) {
              onChange([...items, draft.trim()]);
              setDraft('');
            }
          }}
        />
        <Button
          variant="secondary"
          disabled={!draft.trim()}
          onClick={() => {
            onChange([...items, draft.trim()]);
            setDraft('');
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

function ContactEditor({ items, onChange }: { items: Contact[]; onChange: (v: Contact[]) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  return (
    <div className="stack stack--tight">
      {items.map((c) => (
        <div className="listitem" key={c.id}>
          <div className="grow">
            <div className="small" style={{ fontWeight: 500 }}>
              {c.name}
            </div>
            {c.phone && <div className="tiny dim">{c.phone}</div>}
          </div>
          {c.phone && (
            <>
              <a className="btn btn--secondary" href={`tel:${c.phone}`} aria-label={`Call ${c.name}`}>
                Call
              </a>
              <a className="btn btn--secondary" href={`sms:${c.phone}`} aria-label={`Message ${c.name}`}>
                Text
              </a>
            </>
          )}
          <button className="btn btn--quiet" aria-label={`Remove ${c.name}`} onClick={() => onChange(items.filter((x) => x.id !== c.id))}>
            Remove
          </button>
        </div>
      ))}
      <div className="stack stack--tight">
        <input value={name} placeholder="Name" aria-label="Contact name" onChange={(e) => setName(e.target.value)} />
        <input
          value={phone}
          placeholder="Phone (optional)"
          aria-label="Contact phone"
          inputMode="tel"
          onChange={(e) => setPhone(e.target.value)}
        />
        <Button
          variant="secondary"
          block
          disabled={!name.trim()}
          onClick={() => {
            onChange([...items, { id: uid(), name: name.trim(), phone: phone.trim() || undefined }]);
            setName('');
            setPhone('');
          }}
        >
          Add person
        </Button>
      </div>
    </div>
  );
}

export function Anchr() {
  const store = useStore();
  const plan = store.safetyPlan;
  const setList = useStore((s) => s.setPlanList);
  const setContacts = useStore((s) => s.setPlanContacts);
  const [editing, setEditing] = useState<string | null>(null);

  const first = plan.call[0] ?? plan.message[0];
  const filled = [plan.warnings, plan.helped, plan.message, plan.call, plan.professionals, plan.reasons].filter(
    (x) => x.length > 0,
  ).length;

  return (
    <div className="screen">
      <BackLink to="/" />
      <PageHead title={ANCHR.title} sub={ANCHR.blurb} />

      {first && (
        <Card className="stack stack--tight">
          <span className="eyebrow">Your person</span>
          <div className="row row--between">
            <div>
              <div style={{ fontWeight: 600 }}>{first.name}</div>
              {first.phone && <div className="small dim">{first.phone}</div>}
            </div>
            {first.phone && (
              <div className="row">
                <a className="btn btn--primary" href={`tel:${first.phone}`}>
                  Call
                </a>
                <a className="btn btn--secondary" href={`sms:${first.phone}`}>
                  Text
                </a>
              </div>
            )}
          </div>
        </Card>
      )}

      <div style={{ height: 'var(--s-5)' }} />

      <CrisisLines region={store.settings.region} />

      <hr className="divider" />

      <div className="row row--between" style={{ marginBottom: 'var(--s-3)' }}>
        <span className="eyebrow">My plan</span>
        <span className="tiny dim">{filled} of 6 sections</span>
      </div>
      <Meter value={filled} max={6} label="Safety plan completeness" />

      {filled === 0 && (
        <>
          <div style={{ height: 'var(--s-4)' }} />
          <Card flat>
            <p className="small dim">{ANCHR.emptyPrompt}</p>
            <div style={{ height: 'var(--s-4)' }} />
            <Button block onClick={() => navigate('/anchr/setup')}>
              Set it up with me
            </Button>
          </Card>
        </>
      )}

      <div style={{ height: 'var(--s-4)' }} />

      <div className="stack">
        {ANCHR.sections.map((section) => {
          const isList = ['warnings', 'helped', 'reasons'].includes(section.id);
          const items = plan[section.id as keyof typeof plan] as string[] | Contact[];
          const open = editing === section.id;
          return (
            <div className="card" key={section.id}>
              <div className="row row--between">
                <div className="grow">
                  <div style={{ fontWeight: 600 }}>{section.title}</div>
                  <div className="tiny dim">{section.hint}</div>
                </div>
                <button className="btn btn--quiet" onClick={() => setEditing(open ? null : section.id)}>
                  {open ? 'Done' : items.length ? 'Edit' : 'Add'}
                </button>
              </div>

              {!open && items.length > 0 && (
                <div className="stack stack--tight" style={{ marginTop: 'var(--s-3)' }}>
                  {isList
                    ? (items as string[]).map((i, n) => (
                        <p className="small" key={n}>
                          · {i}
                        </p>
                      ))
                    : (items as Contact[]).map((c) => (
                        <div className="row row--between" key={c.id}>
                          <span className="small">{c.name}</span>
                          {c.phone && (
                            <span className="row">
                              <a className="btn btn--secondary" href={`tel:${c.phone}`} aria-label={`Call ${c.name}`}>
                                Call
                              </a>
                              <a className="btn btn--secondary" href={`sms:${c.phone}`} aria-label={`Message ${c.name}`}>
                                Text
                              </a>
                            </span>
                          )}
                        </div>
                      ))}
                </div>
              )}

              {open && (
                <div style={{ marginTop: 'var(--s-4)' }}>
                  {isList ? (
                    <ListEditor
                      items={items as string[]}
                      placeholder="Write one, then Add"
                      onChange={(v) => setList(section.id as ListKey, v)}
                    />
                  ) : (
                    <ContactEditor items={items as Contact[]} onChange={(v) => setContacts(section.id as ContactKey, v)} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ height: 'var(--s-6)' }} />
      <p className="tiny dim">
        This plan is stored on this device only. It is not uploaded, not backed up to us, and not readable by anyone
        else. There is no server.
      </p>
    </div>
  );
}

export function AnchrSetup() {
  const plan = useStore((s) => s.safetyPlan);
  const setList = useStore((s) => s.setPlanList);
  const setContacts = useStore((s) => s.setPlanContacts);
  const [step, setStep] = useState(0);
  const section = ANCHR.sections[step];
  const isList = ['warnings', 'helped', 'reasons'].includes(section.id);
  const last = step === ANCHR.sections.length - 1;

  return (
    <div className="screen">
      <PageHead title="Set up the Anchr" sub="Six short sections. Skip any of them." onBack={() => (step === 0 ? back('/anchr') : setStep(step - 1))} />
      <Meter value={step + 1} max={ANCHR.sections.length} label={`Step ${step + 1}`} />
      <div style={{ height: 'var(--s-6)' }} />

      <div className="stack stack--tight">
        <h3>{section.title}</h3>
        <p className="small dim">{section.hint}</p>
      </div>

      <div style={{ height: 'var(--s-4)' }} />

      {isList ? (
        <ListEditor
          items={plan[section.id as ListKey]}
          placeholder="Write one, then Add"
          onChange={(v) => setList(section.id as ListKey, v)}
        />
      ) : (
        <ContactEditor items={plan[section.id as ContactKey]} onChange={(v) => setContacts(section.id as ContactKey, v)} />
      )}

      <div style={{ height: 'var(--s-8)' }} />
      <Button block onClick={() => (last ? navigate('/anchr') : setStep(step + 1))}>
        {last ? 'Finish' : 'Next'}
      </Button>
      <div style={{ height: 'var(--s-3)' }} />
      <Button variant="quiet" block onClick={() => (last ? navigate('/anchr') : setStep(step + 1))}>
        Skip this one
      </Button>
    </div>
  );
}
