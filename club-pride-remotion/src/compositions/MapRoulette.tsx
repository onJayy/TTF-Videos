import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, random, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, FONT} from '../brand';
import {Club, clubById, clubsFor} from '../data/clubs';
import {roundFor} from '../data/rounds';
import {endStart, resultStart, T} from '../timing';
import {Confetti} from '../components/Confetti';
import {DarkBackground} from '../components/DarkBackground';
import {LandingHeadline} from '../components/LandingHeadline';
import {MusicBed} from '../components/MusicBed';
import {RapidRound} from '../components/RapidRound';
import {EndCard, Result} from '../components/ResultAndEnd';
import {Sfx} from '../components/Sfx';
import {StadiumBadge} from '../components/StadiumBadge';
import {MapView, project, toKm, UkMap} from '../components/UkMap';

export type MapRouletteProps = {clubId: string};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const HOP_START = 8;
const LAND = 68;
const BASE: MapView = {cx: toKm(53.0, -1.27)[0], cy: toKm(53.0, -1.27)[1], scale: 3.05, screenY: 1060};
const LONDON = ['arsenal', 'brentford', 'chelsea', 'crystal-palace', 'fulham', 'spurs', 'west-ham'];
const PAIRS: [string, string][] = [['man-city', 'man-utd'], ['liverpool', 'everton'], ['newcastle', 'sunderland']];

/** Screen positions for every badge. London's grounds fan out round a circle; close neighbours are pushed apart. */
const layout = (clubs: Club[], v: MapView, spread: number) => {
  const pos: Record<string, {x: number; y: number; rx: number; ry: number}> = {};
  clubs.forEach((c) => {
    const [x, y] = toKm(c.lat, c.lon);
    const [sx, sy] = project(v, x, y);
    pos[c.id] = {x: sx, y: sy, rx: sx, ry: sy};
  });
  const lon = clubs.filter((c) => LONDON.includes(c.id));
  if (lon.length) {
    const cx = lon.reduce((s, c) => s + pos[c.id].rx, 0) / lon.length;
    const cy = lon.reduce((s, c) => s + pos[c.id].ry, 0) / lon.length;
    const sorted = lon.map((c) => ({c, a: Math.atan2(pos[c.id].ry - cy, pos[c.id].rx - cx)})).sort((a, b) => a.a - b.a);
    const R = 104;
    sorted.forEach((e, i) => {
      const a = sorted[0].a + (i / sorted.length) * Math.PI * 2;
      pos[e.c.id].x = pos[e.c.id].rx + (cx + Math.cos(a) * R - pos[e.c.id].rx) * spread;
      pos[e.c.id].y = pos[e.c.id].ry + (cy + Math.sin(a) * R - pos[e.c.id].ry) * spread;
    });
  }
  PAIRS.forEach(([a, b]) => {
    if (!pos[a] || !pos[b]) return;
    const dx = pos[b].x - pos[a].x, dy = pos[b].y - pos[a].y, d = Math.hypot(dx, dy) || 1;
    const need = Math.max(0, 58 - d) / 2 * spread;
    pos[a].x -= (dx / d) * need; pos[a].y -= (dy / d) * need;
    pos[b].x += (dx / d) * need; pos[b].y += (dy / d) * need;
  });
  return pos;
};

const MapIntro: React.FC<{club: Club; total: number}> = ({club, total}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const clubs = useMemo(() => clubsFor(club.id), [club.id]);

  // hop schedule: gaps grow (fast -> slow) and the final hop lands on the club
  const hops = useMemo(() => {
    const out: {at: number; id: string}[] = [];
    let t = HOP_START, gap = 1.6, k = 0, prev = '';
    const others = clubs.filter((c) => c.id !== club.id);
    while (t < LAND - 1) {
      let c = others[Math.floor(random(`hop${k}`) * others.length)];
      if (c.id === prev) c = others[(others.indexOf(c) + 1) % others.length];
      out.push({at: Math.round(t), id: c.id});
      prev = c.id;
      t += gap;
      gap *= 1.17;
      k++;
    }
    out.push({at: LAND, id: club.id});
    return out;
  }, [clubs, club.id]);
  const cur = [...hops].reverse().find((h) => f >= h.at);
  const landed = f >= LAND;

  // camera: settle-in at the start, zoom onto the club after landing
  const [tx, ty] = toKm(club.lat, club.lon);
  const zoomU = interpolate(f, [LAND + 6, LAND + 26], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const intro = interpolate(f, [0, 14], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const view: MapView = {
    cx: BASE.cx + (tx - BASE.cx) * zoomU,
    cy: BASE.cy + (ty - BASE.cy) * zoomU,
    scale: BASE.scale * (0.92 + 0.08 * intro) * Math.exp(Math.log(3.2) * zoomU),
    screenY: BASE.screenY! + (1150 - BASE.screenY!) * zoomU,
  };
  const pos = layout(clubs, view, 1 - zoomU);
  const lonPos = pos['arsenal'];
  const exit = interpolate(f, [T.intro - 12, T.intro], [0, 1], clamp);
  const hook = interpolate(f, [0, 5], [0, 1], clamp) * (1 - interpolate(f, [LAND - 2, LAND + 3], [0, 1], clamp));

  return (
    <AbsoluteFill style={{opacity: 1 - exit}}>
      <UkMap view={view} />
      {/* haze at the top so the headline reads */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 520, background: 'linear-gradient(180deg, rgba(236,242,245,.92) 0%, rgba(236,242,245,0) 100%)'}} />
      {/* leader lines from fanned-out London badges to their real spots */}
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: 1 - zoomU}}>
        {clubs.filter((c) => LONDON.includes(c.id)).map((c) => (
          <g key={c.id}>
            <line x1={pos[c.id].rx} y1={pos[c.id].ry} x2={pos[c.id].x} y2={pos[c.id].y} stroke="#7E867B" strokeWidth={1.6} />
            <circle cx={pos[c.id].rx} cy={pos[c.id].ry} r={3.5} fill={BRAND.greenDeep} />
          </g>
        ))}
        {lonPos ? <circle cx={lonPos.rx} cy={lonPos.ry} r={0} /> : null}
      </svg>
      {clubs.map((c) => {
        const p = pos[c.id];
        const isCur = cur?.id === c.id;
        const isTarget = c.id === club.id;
        const since = isCur ? f - (cur?.at ?? 0) : 99;
        const hopPop = isCur && !landed ? 1.35 + 0.35 * Math.exp(-since / 4) : 1;
        const landPop = landed && isTarget ? spring({frame: f - LAND, fps, config: {damping: 8, mass: 0.6}}) : 0;
        const size = 74 * hopPop * (1 + landPop * 0.9 + (isTarget ? zoomU * 0.9 : 0)) * (landed && !isTarget ? 1 - zoomU * 0.4 : 1);
        return (
          <div key={c.id} style={{position: 'absolute', left: p.x - size / 2, top: p.y - size / 2, width: size, height: size, zIndex: isCur ? 5 : 1,
            opacity: landed && !isTarget ? 1 - zoomU * 0.7 : intro}}>
            {isCur ? (
              <>
                <div style={{position: 'absolute', left: -size * 0.6, top: -size * 0.6, width: size * 2.2, height: size * 2.2, borderRadius: '50%',
                  background: `radial-gradient(circle, ${landed ? club.colour : 'rgba(255,214,74,1)'} 0%, ${landed ? club.colour + '66' : 'rgba(255,214,74,.45)'} 35%, rgba(255,214,74,0) 68%)`}} />
                <div style={{position: 'absolute', left: -8, top: -8, width: size + 16, height: size + 16, borderRadius: '50%', border: `5px solid ${landed ? club.colour : '#FFD54A'}`, boxShadow: '0 0 18px rgba(255,214,74,.9)'}} />
              </>
            ) : null}
            <StadiumBadge club={c} size={size} />
          </div>
        );
      })}
      {/* name tag for the light's current club */}
      {cur && !landed ? (() => {
        const c = clubById(cur.id);
        const p = pos[c.id];
        const since = f - cur.at;
        const a = Math.min(1, since / 2 + 0.4);
        const left = p.x > 600;
        return (
          <div style={{position: 'absolute', left: left ? p.x - 74 : p.x + 74, top: p.y, transform: `translate(${left ? '-100%' : '0'}, -50%) translateY(${(1 - a) * 12}px)`, opacity: a,
            background: '#fff', borderRadius: 20, padding: '12px 24px', borderLeft: `8px solid ${c.colour}`, boxShadow: '0 12px 30px rgba(0,0,0,.22)', whiteSpace: 'nowrap', zIndex: 6}}>
            <div style={{fontWeight: 800, fontSize: 40, color: BRAND.ink, lineHeight: 1.1}}>{c.short}</div>
            <div style={{fontWeight: 500, fontSize: 24, color: '#6E756C'}}>{c.ground}</div>
          </div>
        );
      })() : null}
      {/* ripple on landing */}
      {landed && f - LAND < 20 ? (
        <div style={{position: 'absolute', left: pos[club.id].x - 40 - (f - LAND) * 9, top: pos[club.id].y - 40 - (f - LAND) * 9, width: 80 + (f - LAND) * 18, height: 80 + (f - LAND) * 18,
          borderRadius: '50%', border: `6px solid ${club.colour}`, opacity: 1 - (f - LAND) / 20}} />
      ) : null}
      {/* hook */}
      <div style={{position: 'absolute', left: 540, top: 250, transform: `translate(-50%,-50%) scale(${0.8 + 0.2 * hook})`, opacity: hook, background: BRAND.greenDark, color: '#fff',
        fontWeight: 800, fontSize: 56, padding: '18px 46px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 24px 60px rgba(0,0,0,.3)'}}>
        Where&apos;s it landing?
      </div>
      <LandingHeadline club={club} total={total} at={LAND + 4} top={250} />
      <Confetti at={LAND} colors={[club.colour, club.colour2 ?? '#fff', '#FFFFFF', BRAND.mint]} count={70} />
      {/* sound */}
      <Sfx at={0} src="whoosh.wav" volume={0.45} />
      <Sfx at={HOP_START} src="riser.wav" volume={0.3} />
      {hops.slice(0, -1).map((h, i) => <Sfx key={i} at={h.at} src="click.wav" volume={0.6} />)}
      <Sfx at={LAND} src="land.wav" volume={0.9} />
      <Sfx at={LAND + 4} src="slam.wav" volume={0.45} />
      <Sfx at={LAND + 6} src="whoosh_down.wav" volume={0.35} />
    </AbsoluteFill>
  );
};

export const MapRoulette: React.FC<MapRouletteProps> = ({clubId}) => {
  const f = useCurrentFrame();
  const club = clubById(clubId);
  const round = roundFor(clubId);
  const tint = interpolate(f, [T.intro, T.intro + 20], [0.4, 0.12], clamp);
  return (
    <AbsoluteFill style={{fontFamily: FONT, color: '#fff'}}>
      <DarkBackground tint={club.colour} tintAmount={tint} />
      <Sequence durationInFrames={T.intro} name="Map roulette"><MapIntro club={club} total={round.questions.length} /></Sequence>
      <Sequence from={T.intro} durationInFrames={resultStart(round) - T.intro} name="Rapid round"><RapidRound club={club} round={round} /></Sequence>
      <Sequence from={resultStart(round)} durationInFrames={T.result} name="Result"><Result club={club} round={round} /></Sequence>
      <Sequence from={endStart(round)} durationInFrames={T.end} name="End card"><EndCard round={round} /></Sequence>
      <MusicBed />
    </AbsoluteFill>
  );
};
