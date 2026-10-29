# TTF – Club Pride ad templates (Remotion)

Two 9:16 (1080×1920) video templates that promote the **Club Pride** game mode in Trivia Ten Football:

| Composition | Hook | Then |
|---|---|---|
| `SlotSpin` | A slot-machine reel of stadium badges spins, rattles and lands on a club | rapid-fire round from your real screen recording → score + fan rank → "Can you beat it?" end card |
| `MapRoulette` | A spotlight hops between grounds on a map of England, slows, lands on a club and zooms in | same rapid-fire round → score → end card |

Each video is ~16 s for a 6-question round (length adjusts to the number of questions).

## Quick start

```bash
npm install
npm run studio          # live preview in the browser, scrub the timeline, change the club
npm run render:slot     # -> out/slot-spin.mp4   (Arsenal by default)
npm run render:map      # -> out/map-roulette.mp4 (West Ham by default)
```

Render any club that has a round:

```bash
npx remotion render SlotSpin out/west-ham-slot.mp4 --props='{"clubId":"west-ham"}'
npx remotion render MapRoulette out/arsenal-map.mp4 --props='{"clubId":"arsenal"}'
```

## Add a new club round

1. Screen-record a Club Pride round in the TTF app.
2. Compress it into `public/rounds/<club-id>.mp4` (no audio, so background music on your phone is never included):
   ```bash
   ffmpeg -i ScreenRecording.mov -an -vf "fps=30,scale=720:-2" -c:v libx264 -crf 24 -pix_fmt yuv420p public/rounds/newcastle.mp4
   ```
3. Note the second each answer turns green/red in that file, and whether it was right.
4. Add it to `src/data/rounds.ts`:
   ```ts
   newcastle: {clubId: 'newcastle', video: 'rounds/newcastle.mp4', questions: [
     {reveal: 5.2, correct: true}, {reveal: 11.9, correct: false}, /* ... */
   ]},
   ```
5. Render with `--props='{"clubId":"newcastle"}'`.

Clubs (names, grounds, colours, map positions) live in `src/data/clubs.ts`. Clubs outside this season's Premier League (e.g. West Ham) are added to the reel/map automatically when they are the featured club.

## Where things live

```
src/
  Root.tsx                 compositions + default props
  timing.ts                all pacing (intro length, seconds per question, result, end card)
  brand.ts                 TTF colours and font
  data/clubs.ts            clubs, grounds, colours, coordinates
  data/rounds.ts           recordings + reveal times + fan ranks
  compositions/SlotSpin.tsx
  compositions/MapRoulette.tsx
  components/              RapidRound, Phone, StadiumBadge, UkMap, Result/EndCard, Confetti, Sfx, MusicBed …
public/
  rounds/                  compressed screen recordings
  sfx/                     owned sound kit + music bed (regenerate: python3 tools/make_sfx.py)
  map-uk.json              UK coastline/roads/urban areas (Natural Earth, public domain)
  fonts/, img/             Poppins + TTF logo
```

## Notes

- Everything (music, dings, clicks, whooshes) is generated in `tools/make_sfx.py`, so the audio is yours to use.
- If Remotion can't download its own browser on your machine, point it at Chrome: `REMOTION_BROWSER="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run render:slot`.
- Map data © Natural Earth (public domain).
