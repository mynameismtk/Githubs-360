import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Oswald and Inter (variable, latin) are bundled in public/fonts so a render needs no network.
export const DISPLAY = 'Oswald';
export const BODY = 'Inter';
loadFont({family: DISPLAY, url: staticFile('fonts/Oswald.woff2'), weight: '200 700', format: 'woff2'});
loadFont({family: BODY, url: staticFile('fonts/Inter.woff2'), weight: '100 900', format: 'woff2'});

// Campaign palette from the brief. The logo keeps its own official navy / blue / orange.
export const C = {
  purple: '#54206F',
  magenta: '#C52B83',
  orange: '#FF762E',
  yellow: '#FFC943',
  white: '#FFFFFF',
  ink: '#1D1023',
};

// Instagram Reels safe area (UI chrome top ~220 px, caption + buttons bottom ~420 px, actions right ~120 px)
export const SAFE = {top: 250, bottom: 1480, left: 76, right: 1004};
