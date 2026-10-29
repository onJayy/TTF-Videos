import React from 'react';
import {Audio, interpolate, staticFile, useVideoConfig} from 'remotion';

/** Owned groove under the whole video, faded in/out. */
export const MusicBed: React.FC<{volume?: number}> = ({volume = 0.32}) => {
  const {durationInFrames} = useVideoConfig();
  return (
    <Audio
      src={staticFile('sfx/music_bed.wav')}
      volume={(fr) => interpolate(fr, [0, 10, durationInFrames - 20, durationInFrames], [0, volume, volume, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
    />
  );
};
