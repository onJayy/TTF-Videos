import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, random, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, FONT} from '../brand';
import {Club, clubById, clubsFor} from '../data/clubs';
import {roundFor} from '../data/rounds';
import {endStart, resultStart, T} from '../timing';
import {Confetti} from '../components/Confetti';
import {DarkBackground} from '../components/DarkBackground';
import {LandingHeadline} from '../components/LandingHeadline';
import {RapidRound} from '../components/RapidRound';
import {EndCard} from '../components/ResultAndEnd';
import {Sfx} from '../components/Sfx';
import {ClubShield} from '../components/ClubShield';
import {MusicBed} from '../components/MusicBed';

export type SlotSpinProps = {clubId: string};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SPIN_START = 6;
const LAND = 66; // frame the reel stops on the club
const ITEM_H = 236;
const WIN = {x: 90, y: 640, w: 900, h: 708}; // reel window (3 rows)

// deterministic shuffle so the reel order looks random but renders identically every time
const shuffled = (list: Club[], seed: string) =>
  list.map((c, i) => ({c, k: random(`${seed}-${i}`)})).sort((a, b) => a.k - b.k).map((x) => x.c);

const ReelItem: React.FC<{club: Club; y: number; focus: number}> = ({club, y, focus}) => (
  <div style={{position: 'absolute', left: 0, top: y, width: WIN.w, height: ITEM_H, display: 'flex', alignItems: 'center', gap: 34, paddingLeft: 70,
    transform: `scale(${1 + 0.1 * focus})`, transformOrigin: '50% 50%'}}>
    <ClubShield club={club} size={170} glow={focus * 18} />
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <div style={{fontWeight: 800, fontSize: 66, color: BRAND.ink, lineHeight: 1.05, whiteSpace: 'nowrap'}}>{club.short}</div>
      <div style={{fontWeight: 600, fontSize: 28, color: '#6E756C', whiteSpace: 'nowrap', marginTop: 6}}>{club.ground}</div>
    </div>
  </div>
);

const SlotIntro: React.FC<{club: Club; total: number}> = ({club, total}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const list = useMemo(() => shuffled(clubsFor(club.id), 'reel'), [club.id]);
  const L = list.length;
  const target = list.findIndex((c) => c.id === club.id);
  const P_END = 3 * L + target;
  // reel position (in items): fast start, long ease-out, small overshoot + settle
  const u = interpolate(f, [SPIN_START, LAND], [0, 1], {...clamp, easing: Easing.out(Easing.poly(4))});
  const settle = f > LAND ? 0.22 * Math.sin((f - LAND) * 0.55) * Math.exp(-(f - LAND) / 5) : 0;
  const p = P_END * u + settle;
  const speed = Math.abs(P_END * (interpolate(f + 1, [SPIN_START, LAND], [0, 1], {...clamp, easing: Easing.out(Easing.poly(4))}) - u));
  const blur = Math.min(16, speed * 5);

  // clicks each time an item passes the payline (at most one every 2 frames)
  const clicks = useMemo(() => {
    const out: number[] = [];
    let last = -99;
    for (let fr = SPIN_START; fr <= LAND; fr++) {
      const a = Math.floor(P_END * interpolate(fr - 1, [SPIN_START, LAND], [0, 1], {...clamp, easing: Easing.out(Easing.poly(4))}));
      const b = Math.floor(P_END * interpolate(fr, [SPIN_START, LAND], [0, 1], {...clamp, easing: Easing.out(Easing.poly(4))}));
      if (b > a && fr - last >= 2) {
        out.push(fr);
        last = fr;
      }
    }
    return out;
  }, [P_END]);

  const landed = f >= LAND;
  const landPop = landed ? spring({frame: f - LAND, fps, config: {damping: 8, mass: 0.6}}) : 0;
  const machineIn = spring({frame: f, fps, config: {damping: 14, mass: 0.7}});
  const exit = interpolate(f, [T.intro - 12, T.intro], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const hook = interpolate(f, [0, 5], [0, 1], clamp) * (1 - interpolate(f, [LAND - 2, LAND + 3], [0, 1], clamp));
  const flash = landed ? Math.exp(-(f - LAND) / 5) : 0;

  const rows: React.ReactNode[] = [];
  const base = Math.floor(p);
  for (let k = base - 2; k <= base + 3; k++) {
    const c = list[((k % L) + L) % L];
    const y = WIN.h / 2 - ITEM_H / 2 + (k - p) * ITEM_H;
    const isTarget = landed && k === P_END;
    rows.push(<ReelItem key={k} club={c} y={y} focus={isTarget ? landPop : 0} />);
  }

  // chasing bulbs around the machine
  const bulbs: React.ReactNode[] = [];
  const BW = WIN.w + 80, BH = WIN.h + 80, NB = 34;
  for (let i = 0; i < NB; i++) {
    const t = i / NB;
    const per = 2 * (BW + BH);
    let d = t * per, x = 0, y = 0;
    if (d < BW) { x = d; y = 0; } else if (d < BW + BH) { x = BW; y = d - BW; } else if (d < 2 * BW + BH) { x = BW - (d - BW - BH); y = BH; } else { x = 0; y = BH - (d - 2 * BW - BH); }
    const on = landed ? (Math.floor(f / 3) % 2 === 0 ? 1 : 0.35) : ((i + Math.floor(f / 2)) % 4 === 0 ? 1 : 0.3);
    bulbs.push(<div key={i} style={{position: 'absolute', left: WIN.x - 40 + x - 9, top: WIN.y - 40 + y - 9, width: 18, height: 18, borderRadius: '50%',
      background: landed ? club.colour : '#FFE38A', opacity: on, boxShadow: `0 0 ${on > 0.5 ? 18 : 4}px ${landed ? club.colour : '#FFD54A'}`}} />);
  }

  return (
    <AbsoluteFill style={{opacity: 1 - exit, transform: `translateY(${-exit * 160}px) scale(${1 - exit * 0.15})`}}>
      {/* hook */}
      <div style={{position: 'absolute', left: 540, top: 340, transform: `translate(-50%,-50%) scale(${0.8 + 0.2 * hook})`, opacity: hook, background: '#fff', color: BRAND.greenDark,
        fontWeight: 800, fontSize: 58, padding: '18px 46px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 24px 60px rgba(0,0,0,.4)'}}>
        Spin For A Club
      </div>
      {/* machine */}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${0.85 + 0.15 * machineIn + 0.03 * landPop * Math.exp(-(f - LAND) / 8)})`, opacity: machineIn}}>
        <div style={{position: 'absolute', left: WIN.x - 60, top: WIN.y - 60, width: WIN.w + 120, height: WIN.h + 120, borderRadius: 70,
          background: 'linear-gradient(160deg, #2F6B2A 0%, #173816 55%, #0F2410 100%)', boxShadow: '0 40px 120px rgba(0,0,0,.6), inset 0 2px 0 rgba(255,255,255,.18)'}} />
        {bulbs}
        <div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 40, overflow: 'hidden', background: '#F6F5EF'}}>
          <div style={{position: 'absolute', inset: 0, filter: `blur(${blur}px)`}}>{rows}</div>
          {/* cylinder shading */}
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,25,10,.55) 0%, rgba(10,25,10,0) 30%, rgba(10,25,10,0) 70%, rgba(10,25,10,.55) 100%)'}} />
          {/* white flash on landing */}
          <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: flash * 0.7}} />
        </div>
        {/* payline */}
        <div style={{position: 'absolute', left: WIN.x - 14, top: WIN.y + WIN.h / 2 - ITEM_H / 2 - 4, width: WIN.w + 28, height: ITEM_H + 8, borderRadius: 30,
          border: `6px solid ${landed ? club.colour : BRAND.mint}`, boxShadow: `0 0 ${landed ? 50 : 24}px ${landed ? club.colour : 'rgba(126,224,111,.7)'}`}} />
        <div style={{position: 'absolute', left: WIN.x - 44, top: WIN.y + WIN.h / 2 - 22, width: 0, height: 0, borderTop: '22px solid transparent', borderBottom: '22px solid transparent', borderLeft: `30px solid ${landed ? club.colour : BRAND.mint}`}} />
        <div style={{position: 'absolute', left: WIN.x + WIN.w + 14, top: WIN.y + WIN.h / 2 - 22, width: 0, height: 0, borderTop: '22px solid transparent', borderBottom: '22px solid transparent', borderRight: `30px solid ${landed ? club.colour : BRAND.mint}`}} />
      </div>
      <LandingHeadline club={club} total={total} at={LAND + 4} top={340} />
      <Confetti at={LAND} colors={[club.colour, club.colour2 ?? '#fff', '#FFFFFF', BRAND.mint]} count={80} />
      {/* sound */}
      <Sfx at={0} src="whoosh.wav" volume={0.5} />
      <Sfx at={SPIN_START} src="riser.wav" volume={0.35} />
      {clicks.map((fr) => <Sfx key={fr} at={fr} src="click.wav" volume={0.55} />)}
      <Sfx at={LAND} src="land.wav" volume={0.9} />
      <Sfx at={LAND + 4} src="slam.wav" volume={0.45} />
    </AbsoluteFill>
  );
};

export const SlotSpin: React.FC<SlotSpinProps> = ({clubId}) => {
  const f = useCurrentFrame();
  const club = clubById(clubId);
  const round = roundFor(clubId);
  const tint = interpolate(f, [LAND, LAND + 10, T.intro, T.intro + 20], [0, 0.55, 0.45, 0.12], clamp);
  return (
    <AbsoluteFill style={{fontFamily: FONT, color: '#fff'}}>
      <DarkBackground tint={club.colour} tintAmount={tint} />
      <Sequence durationInFrames={T.intro} name="Slot spin"><SlotIntro club={club} total={round.questions.length} /></Sequence>
      <Sequence from={T.intro} durationInFrames={resultStart(round) - T.intro} name="Rapid round"><RapidRound club={club} round={round} /></Sequence>
      <Sequence from={endStart(round)} durationInFrames={T.end} name="End card"><EndCard round={round} /></Sequence>
      <MusicBed />
    </AbsoluteFill>
  );
};

