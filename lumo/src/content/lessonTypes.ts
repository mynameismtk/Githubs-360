export type LessonBlock =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'pull'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'try'; text: string };

export interface Lesson {
  id: string;
  title: string;
  blurb: string;
  minutes: number;
  mo: 'sleepy' | 'listening' | 'warm' | 'proud' | 'resting' | 'glowing';
  blocks: LessonBlock[];
  takeaway: string;
}

export interface Course {
  id: string;
  title: string;
  blurb: string;
  premium: boolean;
  lessons: Lesson[];
}
