import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND} from '../brand';
import {Club} from '../data/clubs';

/** "ARSENAL FANS" slam + "6 questions. Can you get 6/6?" — appears at local frame `at`. */
export const LandingHeadline: React.FC<{club: Club; total: number; at: number; top: number}> = ({club, total, at, top}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame: f - at, fps, config: {damping: 9, mass: 0.7}});
  const b = spring({frame: f - at - 7, fps, config: {damping: 13}});
  if (f < at) return null;
  return (
    <>
      <div style={{position: 'absolute', left: 540, top, transform: `translate(-50%,-50%) scale(${0.3 + 0.7 * a}) rotate(-2deg)`, background: club.colour, color: '#fff', fontWeight: 800,
        fontSize: 92, padding: '16px 50px', borderRadius: 30, border: `6px solid ${club.colour2 ?? '#fff'}`, whiteSpace: 'nowrap', boxShadow: '0 30px 80px rgba(0,0,0,.45)', letterSpacing: 1}}>
        {club.short.toUpperCase()} FANS
      </div>
      <div style={{position: 'absolute', left: 540, top: top + 120, transform: `translate(-50%,-50%) translateY(${(1 - b) * 30}px)`, opacity: b, background: BRAND.greenDark, color: '#fff',
        fontWeight: 700, fontSize: 44, padding: '14px 36px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 18px 50px rgba(0,0,0,.35)'}}>
        {total} questions. Can you get {total}/{total}?
      </div>
    </>
  );
};
