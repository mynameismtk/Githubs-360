import {loadFont as loadOswald} from '@remotion/google-fonts/Oswald';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';

export const {fontFamily: DISPLAY} = loadOswald('normal', {weights: ['500', '600', '700'], subsets: ['latin']});
export const {fontFamily: BODY} = loadInter('normal', {weights: ['500', '600', '700', '800'], subsets: ['latin']});

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
