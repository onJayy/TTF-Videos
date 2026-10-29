import React, {useMemo} from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';

/** Two confetti cannons from the bottom corners, fired at frame `at`. */
export const Confetti: React.FC<{at: number; colors?: string[]; count?: number}> = ({at, colors = ['#7EE06F', '#FFFFFF', '#B8F0A8', '#2BA84A', '#FFD54A'], count = 90}) => {
  const f = useCurrentFrame();
  const parts = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => {
        const side = i % 2 ? 1 : -1;
        return {
          ox: side < 0 ? 40 : 1040,
          a: -Math.PI / 2 + side * (0.25 + random(`a${i}`) * 0.45),
          v: 1500 + random(`v${i}`) * 1200,
          c: colors[Math.floor(random(`c${i}`) * colors.length)],
          w: 10 + random(`w${i}`) * 12,
          h: 6 + random(`h${i}`) * 8,
          sp: (random(`s${i}`) - 0.5) * 14,
          ph: random(`p${i}`) * 6,
        };
      }),
    [count, colors],
  );
  const d = (f - at) / 30;
  if (d < 0 || d > 1.6) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {parts.map((p, i) => {
        const x = p.ox + Math.cos(p.a) * p.v * d;
        const y = 1930 + Math.sin(p.a) * p.v * d + 1700 * d * d;
        return (
          <div key={i} style={{position: 'absolute', left: x - p.w / 2, top: y - p.h / 2, width: p.w, height: p.h, background: p.c, opacity: 1 - Math.min(1, d / 1.6), transform: `rotate(${p.ph + p.sp * d}rad)`}} />
        );
      })}
    </AbsoluteFill>
  );
};
