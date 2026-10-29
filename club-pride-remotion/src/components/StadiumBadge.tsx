import React from 'react';
import {Club} from '../data/clubs';

/** Little stadium icon: white disc, club-colour stands, green pitch. */
export const StadiumBadge: React.FC<{club: Club; size?: number; glow?: number}> = ({club, size = 120, glow = 0}) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{overflow: 'visible', filter: `drop-shadow(0 ${size * 0.05}px ${size * 0.1}px rgba(0,0,0,.35))${glow > 0 ? ` drop-shadow(0 0 ${glow}px ${club.colour})` : ''}`}}>
    <circle r="48" fill="#fff" />
    <ellipse cx="0" cy="5" rx="33" ry="24" fill="#E3DED4" />
    <ellipse cx="0" cy="0" rx="33" ry="24" fill={club.colour} />
    <ellipse cx="0" cy="0" rx="33" ry="24" fill="none" stroke={club.colour2 ?? '#fff'} strokeWidth="2.2" opacity="0.65" />
    <ellipse cx="0" cy="0" rx="24.5" ry="17" fill="#fff" />
    <rect x="-17" y="-10.5" width="34" height="21" rx="3" fill="#4FAE4F" />
    <line x1="0" y1="-10.5" x2="0" y2="10.5" stroke="#fff" strokeWidth="1.8" opacity="0.9" />
    <circle r="4.6" fill="none" stroke="#fff" strokeWidth="1.8" opacity="0.9" />
  </svg>
);
