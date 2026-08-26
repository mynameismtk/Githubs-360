/**
 * THE REFLECTR — daily check-in.
 *
 * Four taps, no typing: mood, energy, sleep, save. The first three auto-advance.
 * Context chips and the note are optional and always last.
 */

import { useState } from 'react';
import { CHECKIN, CONTEXT_CHIPS } from '../content';
import type { Energy, Mood, Sleep } from '../store/types';
import { useStore } from '../store/useStore';
import { haptic } from '../lib/haptics';
import { Button, Chip, DotRow, Sheet } from '../components/ui';
import { Mo } from '../components/Mo';

const FACES = ['😞', '🙁', '😐', '🙂', '😌'];

export function CheckInSheet({ onDone, onClose }: { onDone: (lowMood: boolean) => void; onClose: () => void }) {
  const addCheckIn = useStore((s) => s.addCheckIn);
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<Mood | null>(null);
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [sleep, setSleep] = useState<Sleep | null>(null);
  const [chips, setChips] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const save = () => {
    if (!mood || !energy || !sleep) return;
    haptic('complete');
    addCheckIn({ mood, energy, sleep, chips, note: note.trim() || undefined });
    onDone(mood <= 2);
  };

  return (
    <Sheet onClose={onClose} labelledBy="checkin-title">
      <div className="stack stack--loose">
        <div className="row">
          <Mo mood={step >= 3 ? 'warm' : 'listening'} size={56} />
          <div className="grow">
            <h3 id="checkin-title">{CHECKIN.title}</h3>
            <p className="tiny dim">Four taps. Typing is optional.</p>
          </div>
        </div>

        {step === 0 && (
          <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="eyebrow">{CHECKIN.moodQ}</legend>
            <div className="dotrow">
              {CHECKIN.moodFaces.map((label, i) => (
                <button
                  key={label}
                  className="dot"
                  style={{ flexDirection: 'column', gap: 2, minHeight: 74 }}
                  aria-pressed={mood === i + 1}
                  aria-label={`Mood: ${label}`}
                  onClick={() => {
                    haptic('soft');
                    setMood((i + 1) as Mood);
                    setStep(1);
                  }}
                >
                  <span style={{ fontSize: 22 }} aria-hidden="true">
                    {FACES[i]}
                  </span>
                  <span className="tiny">{label}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <div className="stack">
            <span className="eyebrow">{CHECKIN.energyQ}</span>
            <DotRow
              value={energy}
              labels={CHECKIN.energyLabels}
              name="Energy"
              onChange={(v) => {
                setEnergy(v as Energy);
                setStep(2);
              }}
            />
          </div>
        )}

        {step === 2 && (
          <div className="stack">
            <span className="eyebrow">{CHECKIN.sleepQ}</span>
            <div className="dotrow">
              {(['short', 'ok', 'long'] as Sleep[]).map((s) => (
                <button
                  key={s}
                  className="dot"
                  aria-pressed={sleep === s}
                  aria-label={`Sleep: ${CHECKIN.sleepLabels[s]}`}
                  onClick={() => {
                    haptic('soft');
                    setSleep(s);
                    setStep(3);
                  }}
                >
                  {CHECKIN.sleepLabels[s]}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="stack stack--loose">
            <div className="stack stack--tight">
              <span className="eyebrow">{CHECKIN.chipsQ}</span>
              <p className="tiny dim">{CHECKIN.chipsHint}</p>
              <div className="row row--wrap">
                {CONTEXT_CHIPS.map((c) => {
                  const on = chips.includes(c);
                  return (
                    <Chip
                      key={c}
                      label={c}
                      on={on}
                      disabled={!on && chips.length >= 3}
                      onToggle={() => setChips(on ? chips.filter((x) => x !== c) : [...chips, c])}
                    />
                  );
                })}
              </div>
            </div>

            <div className="stack stack--tight">
              <label className="eyebrow" htmlFor="checkin-note">
                {CHECKIN.noteQ}
              </label>
              <p className="tiny dim">{CHECKIN.noteHint}</p>
              <textarea
                id="checkin-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything, or nothing."
              />
            </div>

            <Button block onClick={save}>
              {CHECKIN.save}
            </Button>
          </div>
        )}

        {step > 0 && step < 3 && (
          <Button variant="quiet" block onClick={() => setStep(step - 1)}>
            Back a step
          </Button>
        )}
        {step === 0 && (
          <Button variant="quiet" block onClick={onClose}>
            {CHECKIN.skip}
          </Button>
        )}
      </div>
    </Sheet>
  );
}
