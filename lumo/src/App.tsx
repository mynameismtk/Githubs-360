import { useEffect, useState } from 'react';
import { useRoute } from './lib/router';
import { useStore } from './store/useStore';
import { scheduleTodaysInvitation } from './lib/reminders';
import { TabBar } from './components/TabBar';
import { AnchrFab } from './components/AnchrFab';
import { Home } from './screens/Home';
import { Liftr } from './screens/Liftr';
import { Reflectr, ReflectrEntry } from './screens/Reflectr';
import { Reframr, ReframeList } from './screens/Reframr';
import { Groundr, BodyScan, Breathing, Sounds, VisualisationPlayer } from './screens/Groundr';
import { Anchr, AnchrSetup } from './screens/Anchr';
import { Progress } from './screens/Progress';
import { LessonsHub, LessonReader } from './screens/Lessons';
import { Paywall } from './screens/Paywall';
import { Settings } from './screens/Settings';
import { Onboarding } from './screens/Onboarding';
import { LockScreen, SetCode } from './screens/Lock';

/** Routes that render their own full-screen surface and hide the tab bar. */
const FULLSCREEN = ['liftr', 'lock'];

function Screen({ segments }: { segments: string[] }) {
  const [a, b, c] = segments;
  switch (a) {
    case undefined:
      return <Home />;
    case 'liftr':
      return <Liftr />;
    case 'reflectr':
      return b ? <ReflectrEntry id={b} /> : <Reflectr />;
    case 'reframr':
      return b === 'list' ? <ReframeList /> : <Reframr />;
    case 'groundr':
      if (b === 'bodyscan') return <BodyScan minutes={Number(c) || 10} />;
      if (b === 'breathing') return <Breathing id={c ?? 'coherent'} />;
      if (b === 'vis') return <VisualisationPlayer id={c ?? ''} />;
      if (b === 'sounds') return <Sounds />;
      return <Groundr />;
    case 'anchr':
      return b === 'setup' ? <AnchrSetup /> : <Anchr />;
    case 'progress':
      return <Progress />;
    case 'lessons':
      return b ? <LessonReader id={b} /> : <LessonsHub />;
    case 'paywall':
      return <Paywall />;
    case 'settings':
      return <Settings />;
    case 'lock':
      return <SetCode />;
    default:
      return <Home />;
  }
}

export function App() {
  const { path, segments } = useRoute();
  const settings = useStore((s) => s.settings);
  const markOpened = useStore((s) => s.markOpened);
  const [unlocked, setUnlocked] = useState(false);

  /* theme */
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', settings.theme === 'dark' ? '#14100E' : '#FBF6F0');
  }, [settings.theme]);

  /* opening the app counts, and we say so */
  useEffect(() => {
    markOpened();
  }, [markOpened]);

  /* at most one invitation a day, at the chosen time */
  useEffect(() => {
    scheduleTodaysInvitation(settings.reminderTime);
  }, [settings.reminderTime]);

  if (!settings.onboarded) return <Onboarding />;
  if (settings.lockCode && !unlocked && segments[0] !== 'lock') {
    return <LockScreen onUnlock={() => setUnlocked(true)} />;
  }

  const fullscreen = FULLSCREEN.includes(segments[0] ?? '') || isPlayer(segments);
  const onAnchr = segments[0] === 'anchr';

  return (
    <div className="app">
      <Screen segments={segments} key={path} />
      {!fullscreen && <TabBar />}
      {!fullscreen && !onAnchr && <AnchrFab />}
    </div>
  );
}

function isPlayer(segments: string[]): boolean {
  return segments[0] === 'groundr' && ['bodyscan', 'breathing', 'vis'].includes(segments[1] ?? '');
}
