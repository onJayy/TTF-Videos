import React from 'react';
import {Club} from '../data/clubs';
import {BRAND} from '../brand';

export const ClubChip: React.FC<{club: Club; right?: React.ReactNode; style?: React.CSSProperties}> = ({club, right, style}) => (
  <div style={{position: 'absolute', display: 'flex', alignItems: 'center', gap: 16, background: '#fff', color: BRAND.ink, borderRadius: 999,
    padding: '16px 30px 16px 22px', fontWeight: 700, fontSize: 34, whiteSpace: 'nowrap', boxShadow: '0 18px 50px rgba(0,0,0,.4)', ...style}}>
    <span style={{width: 30, height: 30, borderRadius: '50%', background: club.colour, boxShadow: `inset 0 0 0 5px ${club.colour}, inset 0 0 0 9px ${club.colour2 ?? '#fff'}`}} />
    {club.short}
    <span style={{fontWeight: 600, fontSize: 26, color: BRAND.greenDeep}}>&middot; Club Pride</span>
    {right}
  </div>
);
