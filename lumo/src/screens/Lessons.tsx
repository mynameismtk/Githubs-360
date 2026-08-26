/**
 * LESSONS — five free, then two paid courses.
 * A locked lesson shows its title and blurb honestly rather than pretending
 * not to exist, and tapping it goes to the paywall — never mid-tool.
 */

import { useEffect } from 'react';
import { COURSES, findLesson, courseOfLesson } from '../content';
import type { LessonBlock } from '../content/lessonTypes';
import { paywallAllowed, useStore } from '../store/useStore';
import { navigate, back } from '../lib/router';
import { haptic } from '../lib/haptics';
import { BackLink, Button, Card, Meter, PageHead } from '../components/ui';
import { Mo } from '../components/Mo';

export function LessonsHub() {
  const store = useStore();
  const full = store.entitlement.fullAccess;
  const done = store.lessonsDone;
  /* During the quiet window — after a low check-in or a comfort session — the
     app does not advertise anything at all. */
  const mayOffer = paywallAllowed(store);

  return (
    <div className="screen">
      <PageHead title="Lessons" sub="Short, honest, and none of them will tell you to cheer up." />

      <div className="stack stack--loose">
        {COURSES.map((course) => {
          const locked = course.premium && !full;
          const completed = course.lessons.filter((l) => done.includes(l.id)).length;
          return (
            <section key={course.id} className="stack">
              <div className="row row--between">
                <div>
                  <h3>{course.title}</h3>
                  <p className="small dim">{course.blurb}</p>
                </div>
                {locked && <span className="tag">Full Access</span>}
              </div>

              <Meter value={completed} max={course.lessons.length} label={`${course.title} progress`} />
              <p className="tiny dim">
                {completed} of {course.lessons.length} read
              </p>

              <div className="stack stack--tight">
                {course.lessons.map((l, i) => (
                  <Card
                    key={l.id}
                    onClick={() => navigate(locked ? '/paywall' : `/lessons/${l.id}`)}
                    ariaLabel={locked ? `${l.title}, needs Full Access` : l.title}
                  >
                    <div className="row row--between">
                      <div className="row">
                        <span className="dim tiny" style={{ width: 22 }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <div style={{ fontWeight: 500 }}>{l.title}</div>
                          <div className="tiny dim">
                            {l.blurb} · {l.minutes} min
                          </div>
                        </div>
                      </div>
                      <span className="tiny dim">{done.includes(l.id) ? '✓' : locked ? '🔒' : '→'}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {!full && mayOffer && (
        <>
          <hr className="divider" />
          <Button block onClick={() => navigate('/paywall')}>
            See Full Access
          </Button>
        </>
      )}
    </div>
  );
}

function Block({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case 'h':
      return <h3>{block.text}</h3>;
    case 'pull':
      return <p className="pull">{block.text}</p>;
    case 'list':
      return (
        <ul>
          {block.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      );
    case 'try':
      return (
        <div className="card card--flat" style={{ margin: 'var(--s-6) 0' }}>
          <div className="eyebrow">One thing to try</div>
          <p style={{ marginTop: 'var(--s-2)' }}>{block.text}</p>
        </div>
      );
    default:
      return <p>{block.text}</p>;
  }
}

export function LessonReader({ id }: { id: string }) {
  const lesson = findLesson(id);
  const course = courseOfLesson(id);
  const full = useStore((s) => s.entitlement.fullAccess);
  const done = useStore((s) => s.lessonsDone.includes(id));
  const markDone = useStore((s) => s.markLessonDone);

  useEffect(() => {
    if (lesson && course?.premium && !full) navigate('/paywall', { replace: true });
  }, [lesson, course, full]);

  if (!lesson) {
    return (
      <div className="screen">
        <BackLink to="/lessons" />
        <p className="dim">That lesson is not here.</p>
      </div>
    );
  }

  const siblings = course?.lessons ?? [];
  const index = siblings.findIndex((l) => l.id === id);
  const next = siblings[index + 1];

  return (
    <div className="screen">
      <BackLink to="/lessons" />
      <div className="center" style={{ margin: 'var(--s-4) 0 var(--s-6)' }}>
        <Mo mood={lesson.mo} size={96} />
      </div>
      <PageHead title={lesson.title} sub={`${lesson.minutes} min · ${course?.title ?? ''}`} />

      <article className="prose">
        {lesson.blocks.map((b, i) => (
          <Block key={i} block={b} />
        ))}
      </article>

      <div className="card card--flat" style={{ marginTop: 'var(--s-8)' }}>
        <div className="eyebrow">The short version</div>
        <p className="serif" style={{ fontSize: 'var(--t-22)', marginTop: 'var(--s-2)' }}>
          {lesson.takeaway}
        </p>
      </div>

      <div style={{ height: 'var(--s-6)' }} />

      {!done && (
        <Button
          block
          onClick={() => {
            haptic('complete');
            markDone(id);
          }}
        >
          Mark as read
        </Button>
      )}
      {done && next && (
        <Button block onClick={() => navigate(`/lessons/${next.id}`)}>
          Next: {next.title}
        </Button>
      )}
      {done && !next && (
        <Button block onClick={() => back('/lessons')}>
          Back to lessons
        </Button>
      )}
    </div>
  );
}
