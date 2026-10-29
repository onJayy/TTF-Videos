import {ClubRound} from './data/rounds';

// All timings in frames @ 30 fps. Tweak here to change pacing for both templates.
export const T = {
  intro: 108, // spin / roulette + landing headline (3.6 s)
  perQuestion: 39, // each rapid-fire question (1.3 s)
  leadIn: 0.8, // seconds of recording shown before each answer reveal
  result: 60, // big score + rank
  end: 96, // end card
};

export const roundStart = () => T.intro;
export const resultStart = (r: ClubRound) => T.intro + r.questions.length * T.perQuestion;
export const endStart = (r: ClubRound) => resultStart(r) + T.result;
export const totalFrames = (r: ClubRound) => endStart(r) + T.end;
