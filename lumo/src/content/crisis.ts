/**
 * CRISIS LINE DATASET
 *
 * Region-aware. See ../../SAFETY.md for the last-verified date and the
 * re-verification policy — these numbers must be checked against each provider
 * before any public release, and re-checked on a schedule after that.
 *
 * `dial` is what actually gets dialled (tel:). `display` is what the user sees.
 */

export type RegionCode = 'IN' | 'US' | 'GB' | 'IE' | 'CA' | 'AU' | 'NZ' | 'ZA' | 'INT';

export interface CrisisLine {
  name: string;
  display: string;
  dial?: string;
  sms?: { number: string; body: string };
  url?: string;
  hours: string;
  note?: string;
}

export interface Region {
  code: RegionCode;
  label: string;
  emergency?: { display: string; dial: string };
  lines: CrisisLine[];
}

export const INTERNATIONAL_DIRECTORY = {
  name: 'Find A Helpline',
  url: 'https://findahelpline.com',
  note: 'A directory of free, confidential lines in almost every country.',
};

export const REGIONS: Region[] = [
  {
    code: 'IN',
    label: 'India',
    emergency: { display: '112', dial: '112' },
    lines: [
      {
        name: 'Tele-MANAS',
        display: '14416',
        dial: '14416',
        hours: '24/7',
        note: "India's national mental health helpline. Free. Available in many languages.",
      },
      {
        name: 'KIRAN',
        display: '1800-599-0019',
        dial: '18005990019',
        hours: '24/7',
        note: 'National toll-free mental health rehabilitation helpline.',
      },
      {
        name: 'AASRA',
        display: '+91 98204 66726',
        dial: '+919820466726',
        hours: '24/7',
        note: 'Volunteer-run, confidential.',
      },
    ],
  },
  {
    code: 'US',
    label: 'United States',
    emergency: { display: '911', dial: '911' },
    lines: [
      {
        name: 'Suicide & Crisis Lifeline',
        display: '988',
        dial: '988',
        hours: '24/7',
        note: 'Call or text. Free and confidential.',
      },
      {
        name: 'Crisis Text Line',
        display: 'Text HOME to 741741',
        sms: { number: '741741', body: 'HOME' },
        hours: '24/7',
      },
    ],
  },
  {
    code: 'GB',
    label: 'United Kingdom',
    emergency: { display: '999', dial: '999' },
    lines: [
      {
        name: 'Samaritans',
        display: '116 123',
        dial: '116123',
        hours: '24/7',
        note: 'Free from any phone. They will not rush you.',
      },
      {
        name: 'Shout',
        display: 'Text SHOUT to 85258',
        sms: { number: '85258', body: 'SHOUT' },
        hours: '24/7',
      },
      { name: 'NHS urgent mental health', display: '111, option 2', dial: '111', hours: '24/7' },
    ],
  },
  {
    code: 'IE',
    label: 'Ireland',
    emergency: { display: '112', dial: '112' },
    lines: [
      { name: 'Samaritans', display: '116 123', dial: '116123', hours: '24/7' },
      {
        name: 'Text About It',
        display: 'Text HELLO to 50808',
        sms: { number: '50808', body: 'HELLO' },
        hours: '24/7',
      },
    ],
  },
  {
    code: 'CA',
    label: 'Canada',
    emergency: { display: '911', dial: '911' },
    lines: [
      {
        name: 'Suicide Crisis Helpline',
        display: '988',
        dial: '988',
        hours: '24/7',
        note: 'Call or text, English and French.',
      },
    ],
  },
  {
    code: 'AU',
    label: 'Australia',
    emergency: { display: '000', dial: '000' },
    lines: [
      { name: 'Lifeline', display: '13 11 14', dial: '131114', hours: '24/7' },
      { name: 'Beyond Blue', display: '1300 22 4636', dial: '1300224636', hours: '24/7' },
    ],
  },
  {
    code: 'NZ',
    label: 'New Zealand',
    emergency: { display: '111', dial: '111' },
    lines: [
      { name: 'Need to talk?', display: '1737', dial: '1737', hours: '24/7', note: 'Call or text.' },
      { name: 'Lifeline Aotearoa', display: '0800 543 354', dial: '0800543354', hours: '24/7' },
    ],
  },
  {
    code: 'ZA',
    label: 'South Africa',
    emergency: { display: '10111', dial: '10111' },
    lines: [
      {
        name: 'SADAG Suicide Crisis Line',
        display: '0800 567 567',
        dial: '0800567567',
        hours: '24/7',
      },
    ],
  },
  {
    code: 'INT',
    label: 'Somewhere else',
    lines: [
      {
        name: 'Find A Helpline',
        display: 'findahelpline.com',
        url: 'https://findahelpline.com',
        hours: 'Directory',
        note: 'Free, confidential lines listed by country.',
      },
    ],
  },
];

export const regionByCode = (code: RegionCode): Region =>
  REGIONS.find((r) => r.code === code) ?? REGIONS[REGIONS.length - 1];

/** Best-effort guess from the browser locale. The user can always change it. */
export function guessRegion(): RegionCode {
  const l = (typeof navigator !== 'undefined' && navigator.language) || 'en';
  const region = l.split('-')[1]?.toUpperCase();
  const known: RegionCode[] = ['IN', 'US', 'GB', 'IE', 'CA', 'AU', 'NZ', 'ZA'];
  return (known as string[]).includes(region ?? '') ? (region as RegionCode) : 'INT';
}
