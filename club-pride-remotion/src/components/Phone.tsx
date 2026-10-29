import React from 'react';
import {OffthreadVideo, staticFile} from 'remotion';

export const PHONE = {w: 640, h: 1358, bezel: 12, radius: 92};
export const SCREEN = {w: PHONE.w - PHONE.bezel * 2, h: PHONE.h - PHONE.bezel * 2};

/** iPhone-style mockup showing a slice of a screen recording, with a clean status bar painted over the original. */
export const Phone: React.FC<{video?: string; trimBefore?: number; trimAfter?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({video, trimBefore, trimAfter, style, children}) => (
  <div style={{position: 'absolute', width: PHONE.w, height: PHONE.h, borderRadius: PHONE.radius, background: '#0d0d0d',
    boxShadow: '0 0 0 3px #2c2c2c, 0 0 0 9px #111, 0 70px 140px rgba(0,0,0,.65), 0 0 120px rgba(132,194,122,.25)', ...style}}>
    <div style={{position: 'absolute', left: PHONE.bezel, top: PHONE.bezel, width: SCREEN.w, height: SCREEN.h, borderRadius: PHONE.radius - 12, overflow: 'hidden', background: '#7CC671'}}>
      {video ? <OffthreadVideo src={staticFile(video)} trimBefore={trimBefore} trimAfter={trimAfter} muted style={{width: SCREEN.w, height: SCREEN.h, objectFit: 'cover'}} /> : children}
      {/* clean status bar */}
      <div style={{position: 'absolute', left: 0, top: 0, width: SCREEN.w, height: 92, background: '#7CC671'}}>
        <div style={{position: 'absolute', left: 64, top: 26, fontWeight: 600, fontSize: 29, color: '#111'}}>9:41</div>
        <div style={{position: 'absolute', left: SCREEN.w / 2 - 88, top: 22, width: 176, height: 50, borderRadius: 26, background: '#000'}} />
        <svg style={{position: 'absolute', right: 112, top: 33}} width="38" height="24" viewBox="0 0 36 22">
          <rect x="0" y="14" width="6" height="8" rx="1.5" fill="#111" /><rect x="10" y="10" width="6" height="12" rx="1.5" fill="#111" />
          <rect x="20" y="5" width="6" height="17" rx="1.5" fill="#111" /><rect x="30" y="0" width="6" height="22" rx="1.5" fill="#111" />
        </svg>
        <div style={{position: 'absolute', right: 48, top: 33, width: 50, height: 24, borderRadius: 8, border: '2.5px solid rgba(0,0,0,.75)', padding: 3}}>
          <div style={{width: '80%', height: '100%', borderRadius: 3, background: '#111'}} />
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,.14) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 72%, rgba(255,255,255,.06) 100%)'}} />
    </div>
  </div>
);
