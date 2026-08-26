/**
 * CONTENT LAYER
 * Everything a writer might want to change lives in this folder and nowhere
 * else. No component contains user-facing prose.
 */

import type { Course } from './lessonTypes';
import { FREE_LESSONS } from './lessons.free';
import { SHORT_COURSE_LESSONS } from './lessons.short';
import { LONG_COURSE_LESSONS } from './lessons.long';

export * from './actions';
export * from './copy';
export * from './crisis';
export * from './distortions';
export * from './grounding';
export * from './lessonTypes';
export * from './notifications';
export * from './reframeStarters';
export * from './soundscapes';
export * from './visualisations';
export { BODY_SCAN } from './bodyscan';
export { REFRAME_STARTERS } from './reframeStarters';
export { FREE_LESSONS, SHORT_COURSE_LESSONS, LONG_COURSE_LESSONS };

export const COURSES: Course[] = [
  {
    id: 'understanding',
    title: 'Understanding',
    blurb: 'Five short lessons on what depression does and what helps. Free, always.',
    premium: false,
    lessons: FREE_LESSONS,
  },
  {
    id: 'short',
    title: 'Getting moving',
    blurb: 'Twelve lessons. Behavioural activation done properly, plus rumination and sleep.',
    premium: true,
    lessons: SHORT_COURSE_LESSONS,
  },
  {
    id: 'long',
    title: 'Staying well',
    blurb: 'Eighteen lessons on relapse signatures, maintaining gains, and what to do if it returns.',
    premium: true,
    lessons: LONG_COURSE_LESSONS,
  },
];

export const ALL_LESSONS = COURSES.flatMap((c) => c.lessons);

export const findLesson = (id: string) => ALL_LESSONS.find((l) => l.id === id);
export const courseOfLesson = (id: string) => COURSES.find((c) => c.lessons.some((l) => l.id === id));
