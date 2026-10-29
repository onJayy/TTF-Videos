/**
 * A Club Pride round = one screen recording from the TTF app + the moments each answer was revealed.
 *
 * To add a club:
 *   1. Screen-record a full Club Pride round on your phone.
 *   2. Compress it into public/rounds/<club-id>.mp4  (see README for the ffmpeg command).
 *   3. For each question, note the time (in seconds, in that file) when the answer turns green/red,
 *      and whether you got it right.
 *   4. Add an entry below. The video template picks up the number of questions automatically.
 */
export type Question = {
  reveal: number; // seconds into the recording when the answer colour shows
  correct: boolean;
};

export type ClubRound = {
  clubId: string;
  video: string; // path inside /public
  questions: Question[];
};

export const ROUNDS: Record<string, ClubRound> = {
  arsenal: {
    clubId: 'arsenal',
    video: 'rounds/arsenal.mp4',
    questions: [
      {reveal: 5.68, correct: true}, // FA Cup 2025-26 run
      {reveal: 13.8, correct: false}, // EFL Cup semi scorers
      {reveal: 20.8, correct: false}, // 1-0 away on 31 August
      {reveal: 26.83, correct: true}, // Invincibles gold trophy
      {reveal: 33.67, correct: true}, // Porto
      {reveal: 37.75, correct: true}, // Merino from Real Sociedad
    ],
  },
  'west-ham': {
    clubId: 'west-ham',
    video: 'rounds/west-ham.mp4',
    questions: [
      {reveal: 3.68, correct: false}, // Tony Cottee sold to Everton
      {reveal: 10.05, correct: false}, // Bowen captain year
      {reveal: 13.68, correct: false}, // Kilman fee
      {reveal: 18.63, correct: true}, // Kudus from Ajax
      {reveal: 23.43, correct: true}, // Lyon, Europa League QF
      {reveal: 30.93, correct: true}, // Nuno after 5-1 v Chelsea
    ],
  },
};

export const roundFor = (clubId: string): ClubRound => {
  const r = ROUNDS[clubId];
  if (!r) throw new Error(`No Club Pride round for "${clubId}". Add one in src/data/rounds.ts`);
  return r;
};

// Fan ranks by score percentage (edit freely)
export const RANKS: {min: number; label: string}[] = [
  {min: 0.9, label: 'Club Legend'},
  {min: 0.7, label: 'Season Ticket Holder'},
  {min: 0.4, label: 'Matchgoer'},
  {min: 0, label: 'Plastic'},
];
export const rankFor = (score: number, total: number) => RANKS.find((r) => score / total >= r.min)!.label;
