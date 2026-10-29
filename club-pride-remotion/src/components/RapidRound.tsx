import React from 'react';
import {AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND} from '../brand';
import {Club} from '../data/clubs';
import {ClubRound} from '../data/rounds';
import {leadSec, qFrames} from '../timing';
import {AppScreen} from './AppScreen';
import {ClubChip} from './ClubChip';
import {Confetti} from './Confetti';
import {Phone, PHONE} from './Phone';
import {Sfx} from './Sfx';

const PHONE_SCALE = 0.76;
const PHONE_TOP = 452; // keeps the phone clear of the Reels/TikTok header and caption area

const Tick = ({size = 30}) => (
  <svg width={size} height={size} viewBox="0 0 44 44"><path d="M11 22.5l7.5 7.5L33 15" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Cross = ({size = 30}) => (
  <svg width={size} height={size} viewBox="0 0 44 44"><path d="M14 14l16 16M30 14L14 30" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" /></svg>
);

/** Rapid-fire Club Pride round: one question per qFrames(round); answers revealed on the real recording or on a rebuilt app screen. */
export const RapidRound: React.FC<{club: Club; round: ClubRound}> = ({club, round}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = round.questions.length;
  const QF = qFrames(round);
  const lead = Math.round(leadSec(round) * fps);
  const qi = Math.min(n - 1, Math.floor(f / QF));
  const lf = f - qi * QF;
  const scoreAt = (frame: number) => round.questions.filter((q, i) => q.correct && frame >= i * QF + lead).length;
  const score = scoreAt(f);

  // phone motion: fly in, per-question bump, shake on wrong, exit at the end
  const enter = spring({frame: f, fps, config: {damping: 16, mass: 0.8}});
  const q = round.questions[qi];
  const sinceReveal = lf - lead;
  const bump = lf < 6 ? 1 + 0.03 * Math.sin((lf / 6) * Math.PI) : 1;
  const hitScale = q.correct && sinceReveal >= 0 && sinceReveal < 10 ? 1 + 0.045 * Math.sin((sinceReveal / 10) * Math.PI) : 1;
  const shake = !q.correct && sinceReveal >= 0 && sinceReveal < 10 ? Math.sin(sinceReveal * 2.2) * 14 * (1 - sinceReveal / 10) : 0;
  const exit = interpolate(f, [n * QF - 8, n * QF], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const phoneTransform = `translateX(${shake}px) translateY(${(1 - enter) * 900 - exit * 200}px) rotateX(${(1 - enter) * 24}deg) scale(${PHONE_SCALE * bump * hitScale * (1 - exit * 0.3)})`;

  // stamp
  const stampIn = sinceReveal >= 0 ? spring({frame: sinceReveal, fps, config: {damping: 10, mass: 0.6}}) : 0;
  const stampOut = interpolate(lf, [QF - 5, QF], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flash = q.correct && sinceReveal >= 0 ? Math.exp(-sinceReveal / 7) : 0;
  const redFlash = !q.correct && sinceReveal >= 0 ? Math.exp(-sinceReveal / 6) : 0;
  const head = interpolate(f, [0, 8], [0, 1], {extrapolateRight: 'clamp'}) * (1 - exit);

  return (
    <AbsoluteFill style={{perspective: 2400}}>
      {/* reveal flashes */}
      <div style={{position: 'absolute', left: 540 - 850, top: 1080 - 850, width: 1700, height: 1700, borderRadius: '50%', opacity: flash * 0.85,
        background: 'radial-gradient(circle, rgba(170,240,150,.95) 0%, rgba(110,210,100,.5) 25%, rgba(40,120,40,0) 60%)'}} />
      <div style={{position: 'absolute', inset: 0, opacity: redFlash * 0.45, background: 'radial-gradient(circle at 50% 55%, rgba(214,69,69,.9) 0%, rgba(214,69,69,0) 60%)'}} />

      {/* the phone: one Sequence per question so each plays its own slice of the recording */}
      <div style={{position: 'absolute', left: 540 - PHONE.w / 2, top: PHONE_TOP, width: PHONE.w, height: PHONE.h, transform: phoneTransform, transformOrigin: '50% 0%', opacity: 1 - exit}}>
        {round.questions.map((qq, i) => {
          if (round.video && qq.reveal !== undefined) {
            const tb = Math.round(qq.reveal * fps) - lead;
            return (
              <Sequence key={i} from={i * QF} durationInFrames={QF} layout="none">
                <Phone video={round.video} trimBefore={tb} trimAfter={tb + QF + 2} />
              </Sequence>
            );
          }
          return (
            <Sequence key={i} from={i * QF} durationInFrames={QF} layout="none">
              <Phone><AppScreen club={club} question={qq} index={i} total={n} reveal={lead} scoreBefore={150 * scoreAt(i * QF)} /></Phone>
            </Sequence>
          );
        })}
        {/* quick white blink on question change */}
        <div style={{position: 'absolute', inset: 12, borderRadius: 80, background: '#fff', opacity: qi > 0 ? interpolate(lf, [0, 4], [0.55, 0], {extrapolateRight: 'clamp'}) : 0}} />
      </div>

      {/* header: chip with live score, pips, question counter */}
      <div style={{opacity: head}}>
        <ClubChip club={club} style={{left: 540, top: 300, transform: 'translate(-50%,-50%)'}}
          right={<span style={{marginLeft: 8, background: BRAND.greenDeep, color: '#fff', borderRadius: 999, padding: '4px 16px', fontSize: 28}}>{score}/{n}</span>} />
        <div style={{position: 'absolute', left: 540, top: 384, transform: 'translate(-50%,-50%)', display: 'flex', gap: 14}}>
          {round.questions.map((qq, i) => {
            const shown = f >= i * QF + lead;
            const pop = shown ? spring({frame: f - (i * QF + lead), fps, config: {damping: 9}}) : 0;
            const active = i === qi && !shown;
            return (
              <div key={i} style={{width: 54, height: 54, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: shown ? (qq.correct ? '#2BA84A' : BRAND.red) : 'rgba(255,255,255,.12)', border: active ? '3px solid #7EE06F' : '3px solid rgba(255,255,255,.18)',
                transform: `scale(${shown ? 0.6 + 0.4 * pop : active ? 1 + 0.06 * Math.sin(f / 3) : 1})`, boxShadow: shown && qq.correct ? '0 0 22px rgba(126,224,111,.8)' : 'none'}}>
                {shown ? (qq.correct ? <Tick /> : <Cross />) : <span style={{fontWeight: 700, fontSize: 22, color: 'rgba(255,255,255,.5)'}}>{i + 1}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3-2-1 countdown ring (generated rounds) */}
      {lead >= 60 && sinceReveal < 0 ? (() => {
        const left = Math.ceil((lead - lf) / fps);
        const frac = Math.min(1, lf / lead);
        const pulse = 1 + 0.14 * Math.exp(-((lf % fps) / 5));
        const urgent = left <= 1;
        return (
          <div style={{position: 'absolute', left: 836, top: 540, width: 136, height: 136, transform: `translate(-50%,-50%) scale(${pulse})`, opacity: interpolate(lf, [0, 6], [0, 1], {extrapolateRight: 'clamp'})}}>
            <svg width={136} height={136} viewBox="0 0 136 136">
              <circle cx="68" cy="68" r="58" fill="rgba(7,17,7,.75)" stroke="rgba(255,255,255,.18)" strokeWidth="10" />
              <circle cx="68" cy="68" r="58" fill="none" stroke={urgent ? '#FFB23E' : '#7EE06F'} strokeWidth="10" strokeLinecap="round" transform="rotate(-90 68 68)"
                strokeDasharray={364.4} strokeDashoffset={364.4 * frac} />
            </svg>
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 64, color: '#fff'}}>{Math.max(1, left)}</div>
          </div>
        );
      })() : null}

      {/* stamp */}
      <div style={{position: 'absolute', left: 760, top: 560, transform: `translate(-50%,-50%) rotate(-9deg) scale(${0.4 + 0.6 * stampIn})`, opacity: Math.min(1, stampIn * 3) * stampOut * (sinceReveal >= 0 ? 1 : 0),
        display: 'flex', alignItems: 'center', gap: 14, background: q.correct ? '#2BA84A' : BRAND.red, color: '#fff', fontWeight: 800, fontSize: 44,
        padding: '14px 32px 14px 20px', borderRadius: 24, border: '5px solid #fff', boxShadow: '0 20px 60px rgba(0,0,0,.45)', letterSpacing: 2, whiteSpace: 'nowrap'}}>
        <span style={{width: 46, height: 46, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <span style={{filter: `drop-shadow(0 0 0 ${q.correct ? '#2BA84A' : BRAND.red})`, display: 'flex'}}>
            {q.correct ? (
              <svg width="30" height="30" viewBox="0 0 44 44"><path d="M11 22.5l7.5 7.5L33 15" fill="none" stroke="#2BA84A" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            ) : (
              <svg width="30" height="30" viewBox="0 0 44 44"><path d="M14 14l16 16M30 14L14 30" fill="none" stroke={BRAND.red} strokeWidth="6" strokeLinecap="round" /></svg>
            )}
          </span>
        </span>
        {q.correct ? 'CORRECT' : 'NOT QUITE'}
      </div>

      {round.questions.map((qq, i) => (qq.correct ? <Confetti key={i} at={i * QF + lead} count={50} /> : null))}

      {/* sound */}
      {round.questions.map((qq, i) => {
        const s = scoreAt(i * QF + lead);
        return (
          <React.Fragment key={i}>
            <Sfx at={i * QF} src={i === 0 ? 'whoosh.wav' : 'tick.wav'} volume={i === 0 ? 0.6 : 0.5} />
            {lead >= 60 ? [1, 2].map((k) => <Sfx key={k} at={i * QF + k * fps} src="tick.wav" volume={0.5} />) : null}
            <Sfx at={i * QF + lead} src={qq.correct ? 'correct.wav' : 'wrong.wav'} volume={qq.correct ? 0.7 : 0.55} />
            {qq.correct ? <Sfx at={i * QF + lead + 2} src={`ding_${String(Math.min(11, 3 + s)).padStart(2, '0')}.wav`} volume={0.35} /> : null}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
