export type Club = {
  id: string;
  name: string; // full club name
  short: string; // name used in headlines, e.g. "ARSENAL FANS"
  code: string; // three-letter code shown on the shield badge
  ground: string;
  lat: number;
  lon: number;
  colour: string; // primary club colour (used for badge rim + tints)
  colour2?: string; // secondary colour
  premierLeague: boolean; // in the 2026-27 Premier League?
};

// 2026-27 Premier League (Coventry, Ipswich, Hull promoted; West Ham, Burnley, Wolves relegated)
// plus extra Club Pride clubs that are outside the league this season.
export const CLUBS: Club[] = [
  {id: 'arsenal', code: 'ARS', name: 'Arsenal', short: 'Arsenal', ground: 'Emirates Stadium', lat: 51.5549, lon: -0.1084, colour: '#EF0107', colour2: '#FFFFFF', premierLeague: true},
  {id: 'aston-villa', code: 'AVL', name: 'Aston Villa', short: 'Villa', ground: 'Villa Park', lat: 52.5092, lon: -1.8848, colour: '#670E36', colour2: '#95BFE5', premierLeague: true},
  {id: 'bournemouth', code: 'BOU', name: 'AFC Bournemouth', short: 'Bournemouth', ground: 'Vitality Stadium', lat: 50.7352, lon: -1.8384, colour: '#DA291C', colour2: '#000000', premierLeague: true},
  {id: 'brentford', code: 'BRE', name: 'Brentford', short: 'Brentford', ground: 'Gtech Community Stadium', lat: 51.4907, lon: -0.2886, colour: '#E30613', colour2: '#FFFFFF', premierLeague: true},
  {id: 'brighton', code: 'BHA', name: 'Brighton & Hove Albion', short: 'Brighton', ground: 'Amex Stadium', lat: 50.8616, lon: -0.0837, colour: '#0057B8', colour2: '#FFFFFF', premierLeague: true},
  {id: 'chelsea', code: 'CHE', name: 'Chelsea', short: 'Chelsea', ground: 'Stamford Bridge', lat: 51.4817, lon: -0.191, colour: '#034694', colour2: '#FFFFFF', premierLeague: true},
  {id: 'coventry', code: 'COV', name: 'Coventry City', short: 'Coventry', ground: 'CBS Arena', lat: 52.4481, lon: -1.4956, colour: '#59CBE8', colour2: '#FFFFFF', premierLeague: true},
  {id: 'crystal-palace', code: 'CRY', name: 'Crystal Palace', short: 'Palace', ground: 'Selhurst Park', lat: 51.3983, lon: -0.0855, colour: '#1B458F', colour2: '#C4122E', premierLeague: true},
  {id: 'everton', code: 'EVE', name: 'Everton', short: 'Everton', ground: 'Hill Dickinson Stadium', lat: 53.4246, lon: -3.0003, colour: '#003399', colour2: '#FFFFFF', premierLeague: true},
  {id: 'fulham', code: 'FUL', name: 'Fulham', short: 'Fulham', ground: 'Craven Cottage', lat: 51.4749, lon: -0.2217, colour: '#111111', colour2: '#FFFFFF', premierLeague: true},
  {id: 'hull', code: 'HUL', name: 'Hull City', short: 'Hull', ground: 'MKM Stadium', lat: 53.7462, lon: -0.3677, colour: '#F5A12D', colour2: '#000000', premierLeague: true},
  {id: 'ipswich', code: 'IPS', name: 'Ipswich Town', short: 'Ipswich', ground: 'Portman Road', lat: 52.055, lon: 1.1449, colour: '#3A64A3', colour2: '#FFFFFF', premierLeague: true},
  {id: 'leeds', code: 'LEE', name: 'Leeds United', short: 'Leeds', ground: 'Elland Road', lat: 53.7778, lon: -1.5721, colour: '#FFCD00', colour2: '#1D428A', premierLeague: true},
  {id: 'liverpool', code: 'LIV', name: 'Liverpool', short: 'Liverpool', ground: 'Anfield', lat: 53.4308, lon: -2.9608, colour: '#C8102E', colour2: '#FFFFFF', premierLeague: true},
  {id: 'man-city', code: 'MCI', name: 'Manchester City', short: 'Man City', ground: 'Etihad Stadium', lat: 53.4831, lon: -2.2004, colour: '#6CABDD', colour2: '#FFFFFF', premierLeague: true},
  {id: 'man-utd', code: 'MUN', name: 'Manchester United', short: 'Man Utd', ground: 'Old Trafford', lat: 53.4631, lon: -2.2913, colour: '#DA291C', colour2: '#FBE122', premierLeague: true},
  {id: 'newcastle', code: 'NEW', name: 'Newcastle United', short: 'Newcastle', ground: "St James' Park", lat: 54.9756, lon: -1.6217, colour: '#241F20', colour2: '#FFFFFF', premierLeague: true},
  {id: 'nottm-forest', code: 'NFO', name: 'Nottingham Forest', short: 'Forest', ground: 'City Ground', lat: 52.94, lon: -1.1328, colour: '#DD0000', colour2: '#FFFFFF', premierLeague: true},
  {id: 'sunderland', code: 'SUN', name: 'Sunderland', short: 'Sunderland', ground: 'Stadium of Light', lat: 54.9146, lon: -1.3884, colour: '#EB172B', colour2: '#FFFFFF', premierLeague: true},
  {id: 'spurs', code: 'TOT', name: 'Tottenham Hotspur', short: 'Spurs', ground: 'Tottenham Hotspur Stadium', lat: 51.6043, lon: -0.0664, colour: '#132257', colour2: '#FFFFFF', premierLeague: true},
  // Club Pride clubs outside the 2026-27 Premier League
  {id: 'west-ham', code: 'WHU', name: 'West Ham United', short: 'West Ham', ground: 'London Stadium', lat: 51.5387, lon: -0.0166, colour: '#7A263A', colour2: '#1BB1E7', premierLeague: false},
];

export const clubById = (id: string): Club => {
  const c = CLUBS.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown club "${id}". Add it to src/data/clubs.ts`);
  return c;
};

/** Clubs shown on the reel / map: every Premier League club, plus the featured club if it is outside the league. */
export const clubsFor = (featuredId: string): Club[] => {
  const pl = CLUBS.filter((c) => c.premierLeague);
  const f = clubById(featuredId);
  return f.premierLeague ? pl : [...pl, f];
};
