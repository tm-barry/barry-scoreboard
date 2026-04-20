import type {
  Bracket,
  ByeSlot,
  Match,
  Team,
  TeamSlot,
} from '../interfaces/bracket';

/**
 * Finds the next power of two
 * @param n Number to find next power of two
 * @returns Returns the next power of two greater than n
 */
export function nextPowerOfTwo(n: number) {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

/**
 * Creates a blank match
 * @param round Round to set the match for
 * @param position Position in the round
 * @returns Blank match in round / postion
 */
export function createMatch(round: number, position: number): Match {
  return {
    id: crypto.randomUUID(),
    round,
    position,
    teamA: { type: 'pending' },
    teamB: { type: 'pending' },
    scoreA: null,
    scoreB: null,
    winner: null,
    nextMatchId: null,
    nextSlot: null,
  };
}

/**
 * Genates single elimination matches for given bracket
 * This will REPLACE any existing matches
 * @param bracket Teams to use to setup matches
 */
export function generateSingleEliminationMatches(bracket: Bracket): void {
  if (bracket.teams.length <= 1) {
    bracket.matches = [];
    return;
  }

  const size = nextPowerOfTwo(bracket.teams.length);
  const totalRounds = Math.log2(size);

  bracket.teams = normalizeAndSortTeams(bracket.teams);

  const slots = generateSeedingSlots(size);
  const seedMap = new Map<number, (typeof bracket.teams)[number]>();

  for (const team of bracket.teams) {
    seedMap.set(team.seed!, team);
  }

  // Handle byes
  const seeded: (TeamSlot | ByeSlot)[] = slots.map((seed) => {
    const team = seedMap.get(seed);
    return team ? { type: 'team', id: team.id } : { type: 'bye' };
  });

  const matches: Match[] = [];

  // Setup Round 1
  const roundMatches: Match[] = [];
  for (let i = 0; i < size; i += 2) {
    const match = createMatch(1, i / 2);

    match.teamA = seeded[i];
    match.teamB = seeded[i + 1];

    roundMatches.push(match);
  }

  matches.push(...roundMatches);

  // Build out rest of rounds
  let previousRound = roundMatches;

  for (let round = 2; round <= totalRounds; round++) {
    const currentRound: Match[] = [];

    for (let i = 0; i < previousRound.length; i += 2) {
      const match = createMatch(round, i / 2);

      currentRound.push(match);
    }

    matches.push(...currentRound);

    previousRound = currentRound;
  }

  // Link matches
  const rounds: Record<number, Match[]> = {};

  for (const match of matches) {
    if (!rounds[match.round]) rounds[match.round] = [];
    rounds[match.round].push(match);
  }

  for (let round = 1; round < totalRounds; round++) {
    const current = rounds[round];
    const next = rounds[round + 1];

    for (let i = 0; i < current.length; i++) {
      const parent = current[i];
      const nextMatch = next[Math.floor(i / 2)];

      parent.nextMatchId = nextMatch.id;
      parent.nextSlot = i % 2 === 0 ? 'A' : 'B';
    }
  }

  bracket.matches = matches;
  resolveByes(bracket);
}

export function normalizeAndSortTeams(teams: Team[]) {
  const seeded = teams
    .filter((t) => typeof t.seed === 'number')
    .sort((a, b) => a.seed! - b.seed!);

  const unseeded = teams.filter((t) => typeof t.seed !== 'number');

  const all = [...seeded, ...unseeded];

  let seed = 1;
  for (const t of all) {
    t.seed = seed++;
  }

  return all.sort((a, b) => a.seed! - b.seed!);
}

export function generateSeedingSlots(size: number): number[] {
  if (size === 2) return [1, 2];

  const prev = generateSeedingSlots(size / 2);
  const result: number[] = [];

  for (const v of prev) {
    result.push(v, size + 1 - v);
  }

  return result;
}

/**
 * Manually applies the win to winnerId
 * Useful for byes
 * @param match Match to apply win to
 * @param winnerId Team id to apply win to
 * @param matchMap Map of all matches
 * @param teamMap Map of all Teams
 */
export function applyWin(
  match: Match,
  winner: TeamSlot,
  matchMap: Map<string, Match>,
): void {
  match.winner = winner;

  if (!match.nextMatchId || !match.nextSlot) return;

  const next = matchMap.get(match.nextMatchId);
  if (!next) return;

  // place winner into next match
  if (match.nextSlot === 'A') {
    next.teamA = winner;
  } else {
    next.teamB = winner;
  }

  if (next.teamA.type === 'bye' && next.teamB.type === 'team') {
    applyWin(next, next.teamB, matchMap);
  }

  if (next.teamB.type === 'bye' && next.teamA.type === 'team') {
    applyWin(next, next.teamA, matchMap);
  }
}

/**
 * Resolves byes in the bracket matches
 * @param bracket Bracket to resolve byes
 */
export function resolveByes(bracket: Bracket): void {
  const matchMap = new Map(bracket.matches.map((m) => [m.id, m]));

  for (const match of bracket.matches) {
    if (match.winner) continue;

    const isByeA = match.teamA.type === 'bye';
    const isByeB = match.teamB.type === 'bye';

    if (isByeA && isByeB) continue;

    if (isByeA && match.teamB.type === 'team') {
      applyWin(match, match.teamB, matchMap);
    }

    if (isByeB && match.teamA.type === 'team') {
      applyWin(match, match.teamA, matchMap);
    }
  }
}
