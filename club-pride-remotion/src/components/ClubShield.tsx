import React from 'react';
import {getStaticFiles, Img, staticFile} from 'remotion';
import {Club} from '../data/clubs';

/**
 * Original shield-style badge in the club's colours with its three-letter code.
 * (Official club crests are trademarks, so they are deliberately not reproduced here.)
 */
export const ClubShield: React.FC<{club: Club; size?: number; glow?: number}> = ({club, size = 120, glow = 0}) => {
  const c2 = club.colour2 ?? '#FFFFFF';
  const dark = ['#FFCD00', '#F5A12D', '#FFFFFF', '#6CABDD', '#59CBE8'].includes(club.colour.toUpperCase());
  const txt = dark ? '#111' : '#fff';
  const id = `sh-${club.id}`;
  return (
    <svg width={size} height={size * 1.12} viewBox="0 0 100 112" style={{overflow: 'visible', filter: `drop-shadow(0 ${size * 0.04}px ${size * 0.08}px rgba(0,0,0,.35))${glow > 0 ? ` drop-shadow(0 0 ${glow}px ${club.colour})` : ''}`}}>
      <defs>
        <clipPath id={id}><path d="M50 4 L92 16 V52 C92 78 74 96 50 108 C26 96 8 78 8 52 V16 Z" /></clipPath>
      </defs>
      <path d="M50 0 L96 13 V52 C96 81 76 100 50 112 C24 100 4 81 4 52 V13 Z" fill="#fff" />
      <g clipPath={`url(#${id})`}>
        <rect x="0" y="0" width="100" height="112" fill={club.colour} />
        <rect x="0" y="70" width="100" height="10" fill={c2} opacity="0.9" />
        <rect x="0" y="82" width="100" height="30" fill={club.colour} />
        <path d="M50 4 L92 16 V30 H8 V16 Z" fill="rgba(255,255,255,.14)" />
      </g>
      <text x="50" y="58" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight={800} fontSize="27" fill={txt} letterSpacing="1">{club.code}</text>
      <circle cx="50" cy="93" r="7.5" fill="none" stroke={c2 === club.colour ? '#fff' : c2} strokeWidth="2.4" opacity="0.95" />
    </svg>
  );
};

/** Uses an official badge from public/crests/<club-id>.png|.svg if one has been added, otherwise the colour shield. */
export const ClubBadge: React.FC<{club: Club; size?: number; glow?: number}> = ({club, size = 120, glow = 0}) => {
  const files = getStaticFiles().map((f) => f.name);
  const file = [`crests/${club.id}.png`, `crests/${club.id}.svg`, `crests/${club.id}.webp`].find((n) => files.includes(n));
  if (!file) return <ClubShield club={club} size={size} glow={glow} />;
  return (
    <Img src={staticFile(file)} style={{width: size, height: size * 1.12, objectFit: 'contain',
      filter: `drop-shadow(0 ${size * 0.04}px ${size * 0.08}px rgba(0,0,0,.35))${glow > 0 ? ` drop-shadow(0 0 ${glow}px ${club.colour})` : ''}`}} />
  );
};
