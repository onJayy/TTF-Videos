import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND} from '../brand';
import {Club} from '../data/clubs';
import {ClubRound} from '../data/rounds';
import {T} from '../timing';
import {Sfx} from './Sfx';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Big score count-up. Local frames 0..T.result */
export const Result: React.FC<{club: Club; round: ClubRound}> = ({club, round}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = round.questions.length;
  const score = round.questions.filter((q) => q.correct).length;
  const stepF = 4;
  const shown = Math.min(score, Math.max(0, Math.floor((f - 6) / stepF) + 1));
  const slamAt = 6 + score * stepF + 2;
  const s = spring({frame: f - 2, fps, config: {damping: 12}});
  const out = interpolate(f, [T.result - 6, T.result], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <div style={{position: 'absolute', left: 0, width: 1080, top: 520, textAlign: 'center', fontWeight: 700, fontSize: 40, letterSpacing: 8, color: BRAND.mintSoft, opacity: s}}>
        {club.short.toUpperCase()} &middot; CLUB PRIDE
      </div>
      <div style={{position: 'absolute', left: 0, width: 1080, top: 600, textAlign: 'center', fontWeight: 800, fontSize: 300, lineHeight: 1, color: '#fff', transform: `scale(${0.6 + 0.4 * s})`,
        textShadow: '0 0 60px rgba(126,224,111,.45)'}}>
        {shown}/{n}
      </div>
      {new Array(score).fill(0).map((_, i) => (
        <Sfx key={i} at={6 + i * stepF} src={`ding_${String(Math.min(11, i + 2)).padStart(2, '0')}.wav`} volume={0.32} />
      ))}
      <Sfx at={slamAt} src="slam.wav" volume={0.8} />
    </AbsoluteFill>
  );
};

/** End card with the call to comment. Local frames 0..T.end */
export const EndCard: React.FC<{round: ClubRound}> = ({round}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = round.questions.length;
  const score = round.questions.filter((q) => q.correct).length;
  const a = (from: number) => spring({frame: f - from, fps, config: {damping: 14}});
  const fadeOut = interpolate(f, [T.end - 10, T.end], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: interpolate(f, [0, 8], [0, 1], clamp) * fadeOut}}>
      <Img src={staticFile('img/ttf-logo.png')} style={{position: 'absolute', width: 420, left: 330, top: 360, opacity: a(0), transform: `translateY(${(1 - a(0)) * 30}px)`}} />
      <div style={{position: 'absolute', left: 0, width: 1080, top: 700, textAlign: 'center', fontWeight: 800, fontSize: 92, color: '#fff', transform: `scale(${0.7 + 0.3 * a(6)})`, opacity: a(6)}}>
        {score === n ? `Can you get ${n}/${n}?` : `Can you beat ${score}/${n}?`}
      </div>
      <div style={{position: 'absolute', left: 540, top: 900, transform: `translate(-50%,-50%) scale(${a(14) * (1 + 0.03 * Math.sin(f / 5))})`, display: 'flex', alignItems: 'center', gap: 18,
        background: '#fff', color: BRAND.greenDark, fontWeight: 700, fontSize: 40, padding: '24px 52px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 24px 60px rgba(0,0,0,.4)'}}>
        Comment your score
        <svg width="34" height="40" viewBox="0 0 34 40"><path d="M17 3v28" stroke={BRAND.greenDark} strokeWidth="6" strokeLinecap="round" /><path d="M4 24l13 14 13-14z" fill={BRAND.greenDark} /></svg>
      </div>
      <div style={{position: 'absolute', left: 0, width: 1080, top: 1060, textAlign: 'center', fontWeight: 600, fontSize: 34, color: '#fff', opacity: a(22)}}>Club Pride &middot; pick your club</div>
      <div style={{position: 'absolute', left: 0, width: 1080, top: 1116, textAlign: 'center', fontWeight: 500, fontSize: 30, color: 'rgba(255,255,255,.7)', opacity: a(28)}}>
        Coming soon to iPhone &middot; Waitlist in bio
      </div>
      <Sfx at={6} src="land.wav" volume={0.5} />
    </AbsoluteFill>
  );
};
