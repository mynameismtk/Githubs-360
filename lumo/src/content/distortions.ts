/**
 * COGNITIVE DISTORTIONS — plain English.
 * Shown as a tappable grid in the Reframr. Label is what the user taps;
 * `plain` is the one-line explanation; `example` is a depression-shaped example,
 * not an anxiety one.
 */

export interface Distortion {
  id: string;
  label: string;
  plain: string;
  example: string;
}

export const DISTORTIONS: Distortion[] = [
  {
    id: 'all-or-nothing',
    label: 'All or nothing',
    plain: 'It counts fully or it does not count at all. No middle.',
    example: '"I only got out of bed at four, so the whole day was wasted."',
  },
  {
    id: 'mind-reading',
    label: 'Mind reading',
    plain: 'You decide what someone thinks of you without checking.',
    example: '"They took a day to reply. They are tired of me."',
  },
  {
    id: 'fortune-telling',
    label: 'Fortune telling',
    plain: 'You treat a guess about the future as a fact already settled.',
    example: '"There is no point going. I will feel the same afterwards."',
  },
  {
    id: 'should',
    label: 'Should statements',
    plain: 'A rule about how you ought to be, usually one you would not apply to anyone else.',
    example: '"I should be able to manage this by now."',
  },
  {
    id: 'personalising',
    label: 'Personalising',
    plain: 'You take the blame for something that had many causes, or none of them yours.',
    example: '"The evening was flat and that was because of me."',
  },
  {
    id: 'filtering',
    label: 'Filtering out the good',
    plain: 'The one thing that went badly stays. Everything else falls out.',
    example: '"I cooked, I washed up, I got outside — but I forgot to call back, so today was a failure."',
  },
  {
    id: 'labelling',
    label: 'Labelling myself',
    plain: 'You turn something you did into something you are.',
    example: '"I cancelled again. I am a burden."',
  },
  {
    id: 'catastrophising',
    label: 'Catastrophising',
    plain: 'The worst version becomes the expected version.',
    example: '"If I lose this job I will lose everything else too."',
  },
];

export const distortionById = (id: string) => DISTORTIONS.find((d) => d.id === id);
