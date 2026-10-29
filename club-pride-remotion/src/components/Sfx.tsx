import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';

/** Plays a sound effect from public/sfx at a given frame. */
export const Sfx: React.FC<{at: number; src: string; volume?: number}> = ({at, src, volume = 1}) => (
  <Sequence from={Math.max(0, Math.round(at))} layout="none">
    <Audio src={staticFile(`sfx/${src}`)} volume={volume} />
  </Sequence>
);
