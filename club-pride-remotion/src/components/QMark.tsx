import React from 'react';

// TTF question-mark-with-football mark
const Q = 'M30 46 C30 20 50 10 64 10 C84 10 98 24 98 42 C98 62 80 68 72 77 C66 84 64 90 64 100 L64 106';
export const QMark: React.FC<{color?: string; stroke?: number; size?: number; id?: string}> = ({color = '#fff', stroke = 22, size = 70, id = 'q'}) => (
  <svg viewBox="0 0 120 170" width={size} height={(size * 170) / 120}>
    <defs>
      <mask id={id} maskUnits="userSpaceOnUse">
        <rect width="120" height="170" fill="#fff" />
        <path d={Q} fill="none" stroke="#000" strokeWidth={stroke - 10} strokeLinecap="round" strokeLinejoin="round" />
      </mask>
    </defs>
    <path d={Q} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" mask={`url(#${id})`} />
    <g transform="translate(64 138)" fill="none" stroke={color} strokeWidth={4.5} strokeLinejoin="round">
      <circle r="22" />
      <path d="M0 -8 L7.6 -2.5 L4.7 6.5 L-4.7 6.5 L-7.6 -2.5Z" fill={color} />
      <path d="M0 -8 L0 -21 M7.6 -2.5 L20 -6.5 M4.7 6.5 L12.5 17.5 M-4.7 6.5 L-12.5 17.5 M-7.6 -2.5 L-20 -6.5" />
    </g>
  </svg>
);
