/**
 * VISUALISATIONS
 * Behavioural-activation friendly: they rehearse action and recall capability.
 * They never ask the user to imagine being happy — that fails badly in low mood.
 */

export interface Visualisation {
  id: string;
  title: string;
  blurb: string;
  minutes: number;
  premium?: boolean;
  script: string[];
}

export const VISUALISATIONS: Visualisation[] = [
  {
    id: 'felt-like-yourself',
    title: 'The day you felt like yourself',
    blurb: 'Not a happy memory. An ordinary one, where you were recognisably you.',
    minutes: 6,
    script: [
      'Think of a day, any day, when you felt like yourself. It does not have to be a good day.',
      'Where were you. Put yourself in the room, or the street, or the car.',
      'What time was it. What was the light doing.',
      'What were you wearing. What was on your feet.',
      'What could you hear.',
      'What were your hands doing.',
      'Was anyone with you. If they were, where were they standing.',
      'Find one small detail you had forgotten until now.',
      'That person was you. Not a better version. The same one, on a different day.',
      'Nothing was added to you to make that day possible.',
      'Whatever has been switched down since then is a symptom, and symptoms move.',
      'Come back to the room slowly. Keep the detail you found.',
    ],
  },
  {
    id: 'one-hour-from-now',
    title: 'One hour from now',
    blurb: 'A rehearsal for the next small thing, so your body knows the shape of it.',
    minutes: 5,
    script: [
      'Pick one small thing you might do in the next hour. Small. Smaller than that.',
      'See yourself an hour from now, having already done it.',
      'Where are you standing or sitting.',
      'What is different in the room.',
      'Notice you are not being congratulated. It is quiet. It is only done.',
      'Now go back to the first movement. The first one only.',
      'Sitting up. Or reaching for the glass. Or putting one foot down.',
      'See that movement clearly. That is the entire hurdle.',
      'Everything after it happens more easily than the first movement.',
      'Open your eyes. The first movement is still available.',
    ],
  },
  {
    id: 'warm-room',
    title: 'A warm room',
    blurb: 'Somewhere with nothing expected of you.',
    minutes: 6,
    premium: true,
    script: [
      'Build a room. It can be real or invented.',
      'It is warm, and it is the right kind of dark.',
      'There is one light on, low, in a corner.',
      'The door is closed and nobody is going to knock.',
      'There is a chair or a bed that is exactly the right softness.',
      'There is a blanket, and it is heavy.',
      'Somewhere in the building there is a quiet sound. A boiler, rain, a radio downstairs.',
      'Nobody in this room needs anything from you.',
      'You are not late for anything.',
      'Stay for as long as you want. The room does not close.',
    ],
  },
  {
    id: 'the-week-after',
    title: 'The week after',
    blurb: 'For when this feels permanent. It rehearses ordinariness, not joy.',
    minutes: 6,
    premium: true,
    script: [
      'Imagine an ordinary week, some time after this one.',
      'Not a wonderful week. A three-out-of-five week.',
      'It is a Wednesday afternoon.',
      'You are doing something entirely unremarkable.',
      'The heaviness is somewhere in the background rather than in the middle.',
      'You are not thinking about how you are doing.',
      'That is what recovery looks like from the inside. Mostly it looks like not noticing.',
      'You do not need to believe in that week. You only need to leave room for it.',
    ],
  },
];
