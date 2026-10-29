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
  correct: boolean;
  // Recorded rounds: seconds into the recording when the answer colour shows
  reveal?: number;
  // Generated rounds (no recording needed): the app screen is rebuilt from this text
  q?: string;
  options?: string[]; // exactly 4
  answer?: number; // index of the right option
  pick?: number; // index the "player" taps (defaults to the answer)
};

export type ClubRound = {
  clubId: string;
  video?: string; // path inside /public (recorded rounds only)
  questions: Question[];
  pacing?: {perQuestion: number; leadIn: number}; // frames per question, seconds before the reveal
};

/** Helper for writing generated questions: the right answer is options[answer]. */
const gen = (q: string, options: string[], answer: number, pick = answer): Question => ({q, options, answer, pick, correct: pick === answer});
const READABLE = {perQuestion: 147, leadIn: 4.1}; // 4-second countdown, then the answer (4.9 s per question)

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
  // ---- generated rounds (no recording) ----
  'man-utd': {
    clubId: 'man-utd',
    pacing: READABLE,
    questions: [
      gen('Who did Manchester United beat in the 1999 Champions League final?', ['Juventus', 'Bayern Munich', 'Barcelona', 'AC Milan'], 1),
      gen('Which club did United sign Cristiano Ronaldo from in 2003?', ['Benfica', 'Porto', 'Sporting CP', 'Braga'], 2),
      gen('In which year did Sir Alex Ferguson retire as United manager?', ['2011', '2012', '2013', '2014'], 2),
    ],
  },
  spurs: {
    clubId: 'spurs',
    pacing: READABLE,
    questions: [
      gen('Which club did Spurs sign Son Heung-min from in 2015?', ['Hamburg', 'Bayer Leverkusen', 'Borussia Dortmund', 'Wolfsburg'], 1),
      gen('Which club did Spurs sign Gareth Bale from in 2007?', ['Cardiff City', 'Swansea City', 'Southampton', 'Leeds United'], 2),
      gen("Who scored Spurs' hat-trick in the 2019 Champions League semi-final v Ajax?", ['Harry Kane', 'Son Heung-min', 'Lucas Moura', 'Dele Alli'], 2),
    ],
  },
};

export const roundFor = (clubId: string): ClubRound => {
  const r = ROUNDS[clubId];
  if (!r) throw new Error(`No Club Pride round for "${clubId}". Add one in src/data/rounds.ts`);
  return r;
};

