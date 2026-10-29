import React from 'react';
import {Composition} from 'remotion';
import {FPS, H, W} from './brand';
import {loadFonts} from './fonts';
import {roundFor} from './data/rounds';
import {totalFrames} from './timing';
import {SlotSpin, SlotSpinProps} from './compositions/SlotSpin';
import {MapRoulette, MapRouletteProps} from './compositions/MapRoulette';

loadFonts();

// Change clubId in the Studio props panel (or with --props) to render another club,
// e.g. npx remotion render SlotSpin out/west-ham.mp4 --props='{"clubId":"west-ham"}'
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="SlotSpin"
      component={SlotSpin}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={totalFrames(roundFor('arsenal'))}
      defaultProps={{clubId: 'arsenal'} satisfies SlotSpinProps}
      calculateMetadata={({props}) => ({durationInFrames: totalFrames(roundFor(props.clubId))})}
    />
    <Composition
      id="MapRoulette"
      component={MapRoulette}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={totalFrames(roundFor('west-ham'))}
      defaultProps={{clubId: 'west-ham'} satisfies MapRouletteProps}
      calculateMetadata={({props}) => ({durationInFrames: totalFrames(roundFor(props.clubId))})}
    />
  </>
);
