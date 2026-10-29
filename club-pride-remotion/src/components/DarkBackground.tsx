import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BRAND, H, W} from '../brand';
import {QMark} from './QMark';

/** Dark cinematic TTF background: drifting green glow + faint question-mark pattern. Optional club tint. */
export const DarkBackground: React.FC<{tint?: string; tintAmount?: number}> = ({tint, tintAmount = 0}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const tiles: React.ReactNode[] = [];
  for (let r = -1; r < 12; r++)
    for (let c = -1; c < 7; c++)
      tiles.push(
        <div key={`${r}-${c}`} style={{position: 'absolute', transform: `translate(${c * 200 + (r % 2 ? 100 : 0)}px, ${r * 190}px)`}}>
          <QMark color="#9BD88F" stroke={20} size={70} id={`bg${r}_${c}`} />
        </div>,
      );
  const glow = (x: number, y: number, s: number, o: number) => (
    <div style={{position: 'absolute', left: x - 800, top: y - 800, width: 1600, height: 1600, borderRadius: '50%', opacity: o, transform: `scale(${s})`,
      background: `radial-gradient(circle, ${BRAND.glow} 0%, rgba(96,170,90,.45) 26%, rgba(40,90,38,.18) 50%, rgba(6,11,6,0) 70%)`}} />
  );
  return (
    <AbsoluteFill style={{background: BRAND.night, overflow: 'hidden'}}>
      {glow(540 + 120 * Math.sin(t * 0.4), 1000 + 80 * Math.cos(t * 0.3), 1.15 + 0.05 * Math.sin(t * 1.6), 0.9)}
      {glow(180 + 60 * Math.sin(t * 0.5), 1800, 0.7, 0.35)}
      {tint && tintAmount > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: tintAmount, background: `radial-gradient(circle at 50% 45%, ${tint} 0%, ${tint}AA 30%, rgba(0,0,0,0) 72%)`, mixBlendMode: 'screen'}} />
      ) : null}
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: 0.07, transform: `translate(${(t * 14) % 200}px, ${-((t * 10) % 380)}px)`}}>{tiles}</div>
    </AbsoluteFill>
  );
};
