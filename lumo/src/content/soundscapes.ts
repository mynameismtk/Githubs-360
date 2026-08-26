/**
 * SOUNDSCAPES
 * Generated live in the browser with the Web Audio API rather than shipped as
 * audio files. That means they work offline with nothing downloaded, they never
 * loop audibly, and they add nothing to the bundle size.
 */

export type SoundKind = 'rain' | 'shore' | 'night' | 'hum' | 'fire' | 'wind';

export interface Soundscape {
  id: SoundKind;
  title: string;
  blurb: string;
  premium?: boolean;
}

export const SOUNDSCAPES: Soundscape[] = [
  { id: 'rain', title: 'Rain on a window', blurb: 'Steady, indoors, middle of the afternoon.' },
  { id: 'night', title: 'Night room', blurb: 'Low warm noise. Good for a dark room.' },
  { id: 'hum', title: 'Boiler hum', blurb: 'The sound of a building looking after itself.' },
  { id: 'shore', title: 'Far shore', blurb: 'Slow swells, a long way off.', premium: true },
  { id: 'fire', title: 'Small fire', blurb: 'Crackle and low roar.', premium: true },
  { id: 'wind', title: 'Wind in trees', blurb: 'Moving, never quite repeating.', premium: true },
];
