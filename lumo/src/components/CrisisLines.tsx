import { INTERNATIONAL_DIRECTORY, regionByCode, type RegionCode } from '../content/crisis';
import { ANCHR } from '../content/copy';

/**
 * Crisis lines for the selected region. Numbers dial via tel:, texts open the
 * messaging app pre-filled. Works with no network — the dataset ships with the app.
 */
export function CrisisLines({ region }: { region: RegionCode }) {
  const r = regionByCode(region);
  return (
    <section className="stack" aria-label="Crisis lines">
      <div>
        <h3>{ANCHR.crisisTitle}</h3>
        <p className="dim small">{ANCHR.crisisNote}</p>
      </div>

      {r.lines.map((line) => (
        <div className="card" key={line.name}>
          <div className="row row--between">
            <div>
              <div style={{ fontWeight: 600 }}>{line.name}</div>
              <div className="small dim">
                {line.display} · {line.hours}
              </div>
            </div>
            {line.dial && (
              <a className="btn btn--safety" href={`tel:${line.dial}`} aria-label={`Call ${line.name} on ${line.display}`}>
                Call
              </a>
            )}
            {line.sms && (
              <a
                className="btn btn--safety"
                href={`sms:${line.sms.number}?&body=${encodeURIComponent(line.sms.body)}`}
                aria-label={`Text ${line.name}`}
              >
                Text
              </a>
            )}
            {line.url && (
              <a className="btn btn--secondary" href={line.url} target="_blank" rel="noreferrer">
                Open
              </a>
            )}
          </div>
          {line.note && <p className="small dim" style={{ marginTop: 'var(--s-3)' }}>{line.note}</p>}
        </div>
      ))}

      {r.emergency && (
        <div className="card card--flat">
          <div className="row row--between">
            <div>
              <div style={{ fontWeight: 600 }}>Emergency services</div>
              <div className="small dim">If you are in immediate danger</div>
            </div>
            <a className="btn btn--safety-quiet" href={`tel:${r.emergency.dial}`}>
              {r.emergency.display}
            </a>
          </div>
        </div>
      )}

      {r.code !== 'INT' && (
        <p className="tiny dim">
          Somewhere else, or travelling?{' '}
          <a href={INTERNATIONAL_DIRECTORY.url} target="_blank" rel="noreferrer">
            findahelpline.com
          </a>{' '}
          lists free lines by country.
        </p>
      )}
    </section>
  );
}
