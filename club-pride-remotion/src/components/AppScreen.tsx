import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Club} from '../data/clubs';
import {Question} from '../data/rounds';
import {QMark} from './QMark';
import {SCREEN} from './Phone';

const APP_GREEN = '#7CC671';
const RIGHT = '#2F6E3B';
const WRONG = '#C94A4A';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Rebuilds the TTF Club Pride question screen (as seen in the real app recordings) for generated questions.
 * Local frame 0 = question appears; `reveal` = frame the answer colours show (the tap happens just before).
 */
export const AppScreen: React.FC<{club: Club; question: Question; index: number; total: number; reveal: number; scoreBefore: number}> = ({
  club, question, index, total, reveal, scoreBefore,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opts = question.options ?? [];
  const answer = question.answer ?? 0;
  const pick = question.pick ?? answer;
  const tap = reveal - 7;
  const revealed = f >= reveal;
  const pressed = f >= tap && f < reveal;
  const gained = question.correct ? 150 : 0;
  const score = Math.round(scoreBefore + gained * interpolate(f, [reveal, reveal + 12], [0, 1], clamp));
  const cardIn = spring({frame: f, fps, config: {damping: 16}});
  const plusPop = revealed ? spring({frame: f - reveal, fps, config: {damping: 9, mass: 0.6}}) : 0;
  const nextIn = interpolate(f, [reveal + 4, reveal + 10], [0, 1], clamp);
  const boost = interpolate(f, [0, reveal], [0.62, 0.38], clamp); // multiplier bar drains while you think

  // faint ? pattern like the app background
  const pat: React.ReactNode[] = [];
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 5; c++)
      pat.push(
        <div key={`${r}${c}`} style={{position: 'absolute', left: c * 150 - 40 + (r % 2 ? 75 : 0), top: r * 160 + 40}}>
          <QMark color="rgba(255,255,255,0.22)" stroke={16} size={88} id={`ap${index}_${r}_${c}`} />
        </div>,
      );

  return (
    <div style={{position: 'absolute', inset: 0, width: SCREEN.w, height: SCREEN.h, background: APP_GREEN, overflow: 'hidden', fontFamily: 'Poppins, sans-serif'}}>
      {pat}
      {/* header */}
      <div style={{position: 'absolute', left: 32, top: 104, width: 54, height: 54, borderRadius: '50%', background: 'rgba(255,255,255,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width="22" height="22" viewBox="0 0 22 22"><path d="M4 4l14 14M18 4L4 18" stroke="#1B1F1A" strokeWidth="3.2" strokeLinecap="round" /></svg>
      </div>
      <div style={{position: 'absolute', left: 104, top: 116, fontWeight: 700, fontSize: 21, color: '#fff'}}>Q{index + 1} of {total}</div>
      <div style={{position: 'absolute', right: 32, top: 104, height: 52, borderRadius: 26, background: '#fff', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 10}}>
        <span style={{fontWeight: 700, fontSize: 19, color: '#7A7F78'}}>Score</span>
        <span style={{fontWeight: 800, fontSize: 25, color: '#1B1F1A'}}>{score}</span>
      </div>
      <div style={{position: 'absolute', left: 0, width: SCREEN.w, top: 176, display: 'flex', justifyContent: 'center', gap: 9}}>
        {new Array(total).fill(0).map((_, i) => (
          <div key={i} style={{width: i === index ? 34 : 11, height: 11, borderRadius: 6, background: i === index ? '#F2A7C3' : i < index ? '#fff' : 'rgba(255,255,255,.45)'}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 32, top: 210, fontWeight: 700, fontSize: 15, letterSpacing: 2.6, color: '#fff'}}>POINTS BOOST MULTIPLIER</div>
      <div style={{position: 'absolute', left: 32, top: 251, width: 434, height: 12, borderRadius: 6, background: 'rgba(255,255,255,.4)'}}>
        <div style={{width: `${boost * 100}%`, height: '100%', borderRadius: 6, background: '#E08A23'}} />
      </div>
      <div style={{position: 'absolute', right: 32, top: 238, height: 38, borderRadius: 19, background: '#fff', padding: '0 14px', display: 'flex', alignItems: 'center', fontWeight: 800, fontSize: 19, color: '#E08A23'}}>
        ⚡ 1.5×
      </div>

      {/* question card */}
      <div style={{position: 'absolute', left: 32, top: 400, width: 552, borderRadius: 24, background: '#fff', padding: '30px 30px 32px', textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,.08)', opacity: cardIn, transform: `translateY(${(1 - cardIn) * 24}px)`}}>
        <div style={{fontWeight: 700, fontSize: 15, letterSpacing: 3, color: '#B04A72'}}>{club.name.toUpperCase()}</div>
        <div style={{fontWeight: 800, fontSize: 29, lineHeight: 1.22, color: '#141714', marginTop: 10}}>{question.q}</div>
        {revealed ? <div style={{fontWeight: 700, fontSize: 16, color: '#2E8B3C', marginTop: 8}}>{question.correct ? 'Fast! ' : 'Not quite '}<span style={{color: '#8A8F88', fontWeight: 500}}>{(reveal / fps).toFixed(1)}s</span></div> : null}
      </div>

      {/* options */}
      {opts.map((o, i) => {
        const inA = spring({frame: f - 3 - i * 2, fps, config: {damping: 16}});
        const isRight = i === answer;
        const isPick = i === pick;
        const bg = revealed ? (isRight ? RIGHT : isPick ? WRONG : 'rgba(255,255,255,.5)') : pressed && isPick ? '#E7F2E3' : '#fff';
        const fg = revealed ? (isRight || isPick ? '#fff' : 'rgba(27,31,26,.45)') : '#141714';
        return (
          <div key={i} style={{position: 'absolute', left: 32, top: 742 + i * 106, width: 552, height: 90, borderRadius: 22, background: bg, display: 'flex', alignItems: 'center', gap: 18, paddingLeft: 22,
            opacity: inA, transform: `translateY(${(1 - inA) * 20}px) scale(${pressed && isPick ? 0.97 : 1})`, boxShadow: revealed && isRight ? '0 8px 24px rgba(0,0,0,.18)' : 'none'}}>
            <div style={{width: 42, height: 42, borderRadius: '50%', background: revealed && (isRight || isPick) ? '#fff' : '#ECEDEA', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 17, color: '#6E736C'}}>
              {revealed && isRight ? (
                <svg width="24" height="24" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={RIGHT} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : revealed && isPick ? (
                <svg width="22" height="22" viewBox="0 0 22 22"><path d="M6 6l10 10M16 6L6 16" stroke={WRONG} strokeWidth="3.2" strokeLinecap="round" /></svg>
              ) : (
                'ABCD'[i]
              )}
            </div>
            <div style={{fontWeight: 700, fontSize: 25, color: fg, whiteSpace: 'nowrap'}}>{o}</div>
            {revealed && isRight && question.correct ? (
              <div style={{position: 'absolute', right: 16, top: -24, transform: `scale(${plusPop})`, background: '#fff', borderRadius: 20, padding: '6px 10px 6px 14px', display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 6px 16px rgba(0,0,0,.18)'}}>
                <span style={{fontWeight: 800, fontSize: 24, color: '#141714'}}>+150</span>
                <span style={{fontWeight: 700, fontSize: 14, color: '#C2477A', background: '#F8D3E1', borderRadius: 10, padding: '2px 8px'}}>⚡1.5×</span>
              </div>
            ) : null}
          </div>
        );
      })}

      {/* next button */}
      <div style={{position: 'absolute', left: 32, top: 1180, width: 552, height: 80, borderRadius: 22, background: '#1A1C1A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, fontWeight: 700, fontSize: 24, opacity: nextIn}}>
        Next Question <span style={{fontSize: 26}}>→</span>
      </div>
    </div>
  );
};
