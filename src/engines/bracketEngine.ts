import type { Bracket, Match } from '../interfaces/bracket';

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
    complete: false,

    teamAId: null,
    teamBId: null,

    scoreA: null,
    scoreB: null,

    winnerId: null,

    nextMatchId: null,
    nextSlot: null,
  };
}

/**
 * Checks if a given id is a bye id (< 0)
 * @param id Id to check
 * @returns True is id is a bye id
 */
export function isBye(id: string | null): boolean {
  if (!id) return false;
  return id.startsWith('-');
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

  const matches: Match[] = [];

  // Handle byes
  const seeded = [...bracket.teams];
  let byeId = -1;
  while (seeded.length < size) {
    seeded.push({
      id: byeId.toString(),
      name: '',
    });
    byeId--;
  }

  // Setup Round 1
  const roundMatches: Match[] = [];
  for (let i = 0; i < size; i += 2) {
    const match = createMatch(1, i / 2);

    match.teamAId = seeded[i].id;
    match.teamBId = seeded[i + 1].id;

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
  winnerId: string,
  matchMap: Map<string, Match>,
): void {
  match.winnerId = winnerId;
  match.complete = true;

  if (!match.nextMatchId || !match.nextSlot) return;

  const next = matchMap.get(match.nextMatchId);
  if (!next) return;

  // place winner into next match
  if (match.nextSlot === 'A') {
    next.teamAId = winnerId;
  } else {
    next.teamBId = winnerId;
  }

  // check next match for byes
  const isByeA = isBye(next.teamAId);
  const isByeB = isBye(next.teamBId);

  if (isByeA && next.teamBId) {
    applyWin(next, next.teamBId, matchMap);
  }

  if (isByeB && next.teamAId) {
    applyWin(next, next.teamAId, matchMap);
  }
}

/**
 * Resolves byes in the bracket matches
 * @param bracket Bracket to resolve byes
 */
export function resolveByes(bracket: Bracket): void {
  const matchMap = new Map(bracket.matches.map((m) => [m.id, m]));

  for (const match of bracket.matches) {
    if (match.complete) continue;

    const isByeA = isBye(match.teamAId);
    const isByeB = isBye(match.teamBId);

    if (isByeA && isByeB) continue;

    if (isByeA && match.teamBId) {
      applyWin(match, match.teamBId, matchMap);
    }

    if (isByeB && match.teamAId) {
      applyWin(match, match.teamAId, matchMap);
    }
  }
}
