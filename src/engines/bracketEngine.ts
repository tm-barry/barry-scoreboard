import type {
  Bracket,
  Match,
  Team,
  TeamSlot,
  Slot,
} from '../interfaces/bracket';

/* -------------------------------------------------------
 * PUBLIC API
 * ----------------------------------------------------- */

/**
 * Generates a full single-elimination tournament bracket.
 * @param bracket - The base bracket containing teams (matches will be replaced)
 * @returns A fully constructed single-elimination bracket with matches and links
 */
export function generateSingleEliminationMatches(bracket: Bracket): Bracket {
  if (bracket.teams.length <= 1) {
    return { ...bracket, matches: [] };
  }

  const size = nextPowerOfTwo(bracket.teams.length);
  const totalRounds = Math.log2(size);

  const teams = normalizeAndSortTeams(bracket.teams);

  const slots = generateSeedingSlots(size);

  const seedMap = new Map<number, Team>();
  for (const team of teams) {
    if (team.seed != null) seedMap.set(team.seed, team);
  }

  const seeded: Slot[] = slots.map((seed) => {
    const team = seedMap.get(seed);
    return team ? { type: 'team', id: team.id } : { type: 'bye' };
  });

  let matches: Match[] = [];

  // Round 1
  const round1: Match[] = [];
  for (let i = 0; i < size; i += 2) {
    round1.push(createMatch(1, i / 2, seeded[i], seeded[i + 1]));
  }

  matches.push(...round1);

  // Future rounds
  let prev = round1;

  for (let round = 2; round <= totalRounds; round++) {
    const current: Match[] = [];

    for (let i = 0; i < prev.length; i += 2) {
      current.push(createMatch(round, i / 2));
    }

    matches.push(...current);
    prev = current;
  }

  matches = linkMatches(matches, totalRounds);

  let bracketOut: Bracket = {
    ...bracket,
    teams,
    matches,
  };

  bracketOut = resolveAllByes(bracketOut);

  return bracketOut;
}

/**
 * Sets the winner of a match by selecting a team manually.
 * @param bracket - Current bracket state
 * @param matchId - ID of the match being updated
 * @param teamId - ID of the team being marked as winner
 * @returns Updated bracket with winner applied and propagated
 */
export function setMatchWinner(
  bracket: Bracket,
  matchId: string,
  teamId: string,
): Bracket {
  const match = findMatch(bracket, matchId);
  if (!match) return bracket;

  const winner = getTeamSlotById(match, teamId);
  if (!winner) return bracket;

  const updatedMatch: Match = {
    ...match,
    winner,
  };

  const updated = updateMatch(bracket, updatedMatch);

  return propagateWin(updated, updatedMatch, winner);
}

/**
 * Determines and sets the winner of a match based on scores.
 * @param bracket - Current bracket state
 * @param matchId - ID of the match to evaluate
 * @returns Updated bracket with computed winner applied
 */
export function setMatchWinnerByScore(
  bracket: Bracket,
  matchId: string,
): Bracket {
  const match = findMatch(bracket, matchId);
  if (!match) return bracket;

  if (match.scoreA == null || match.scoreB == null) return bracket;
  if (match.scoreA === match.scoreB) return bracket;

  const winner = match.scoreA > match.scoreB ? match.teamA : match.teamB;

  if (winner.type !== 'team') return bracket;

  const updatedMatch: Match = {
    ...match,
    winner,
  };

  const updated = updateMatch(bracket, updatedMatch);

  return propagateWin(updated, updatedMatch, winner);
}

/**
 * Updates the score for a specific match.
 * @param bracket - Current bracket state
 * @param matchId - ID of the match being updated
 * @param scoreA - Score for team A
 * @param scoreB - Score for team B
 * @returns Updated bracket with new scores applied
 */
export function setMatchScore(
  bracket: Bracket,
  matchId: string,
  scoreA: number,
  scoreB: number,
): Bracket {
  const match = findMatch(bracket, matchId);
  if (!match) return bracket;

  return updateMatch(bracket, {
    ...match,
    scoreA,
    scoreB,
  });
}

/**
 * Resets a match to its initial unresolved state.
 * @param bracket - Current bracket state
 * @param matchId - ID of the match to reset
 * @returns Updated bracket with match reset and downstream effects applied
 */
export function resetMatch(bracket: Bracket, matchId: string): Bracket {
  const match = findMatch(bracket, matchId);
  if (!match) return bracket;

  let updated = updateMatch(bracket, {
    ...match,
    scoreA: null,
    scoreB: null,
    winner: null,
  });

  if (match.nextMatchId && match.nextSlot) {
    const next = findMatch(updated, match.nextMatchId);
    if (next) {
      updated = updateMatch(updated, {
        ...next,
        teamA: match.nextSlot === 'A' ? { type: 'pending' } : next.teamA,
        teamB: match.nextSlot === 'B' ? { type: 'pending' } : next.teamB,
        winner: null,
      });
    }
  }

  return updated;
}

/**
 * Finds a match in a bracket by id
 * @param bracket Bracket to find match in
 * @param matchId Id to find match
 * @returns The match found
 */
export function findMatch(
  bracket: Bracket,
  matchId: string,
): Match | undefined {
  return bracket.matches.find((m) => m.id === matchId);
}

/**
 * Updates a match in a bracket by matching id
 * @param bracket Bracket to update match in
 * @param updated Updated match
 * @returns Bracket with match updated
 */
export function updateMatch(bracket: Bracket, updated: Match): Bracket {
  return {
    ...bracket,
    matches: bracket.matches.map((m) => (m.id === updated.id ? updated : m)),
  };
}

/**
 * Finds a matching team slot by team id in a match
 * @param match Match to find team slot in
 * @param teamId Team id to use to match slot
 * @returns Matching team slot by id
 */
export function getTeamSlotById(match: Match, teamId: string): TeamSlot | null {
  if (match.teamA.type === 'team' && match.teamA.id === teamId) {
    return match.teamA;
  }

  if (match.teamB.type === 'team' && match.teamB.id === teamId) {
    return match.teamB;
  }

  return null;
}

/* -------------------------------------------------------
 * Helpers
 * ----------------------------------------------------- */

function propagateWin(
  bracket: Bracket,
  match: Match,
  winner: TeamSlot,
): Bracket {
  if (!match.nextMatchId || !match.nextSlot) return bracket;

  const next = findMatch(bracket, match.nextMatchId);
  if (!next) return bracket;

  const updatedNext: Match = {
    ...next,
    teamA: match.nextSlot === 'A' ? winner : next.teamA,
    teamB: match.nextSlot === 'B' ? winner : next.teamB,
  };

  let updated = updateMatch(bracket, updatedNext);

  updated = resolveSingleBye(updated, updatedNext);

  return updated;
}

function resolveSingleBye(bracket: Bracket, match: Match): Bracket {
  if (match.teamA.type === 'bye' && match.teamB.type === 'team') {
    return setMatchWinner(bracket, match.id, match.teamB.id);
  }

  if (match.teamB.type === 'bye' && match.teamA.type === 'team') {
    return setMatchWinner(bracket, match.id, match.teamA.id);
  }

  return bracket;
}

function resolveAllByes(bracket: Bracket): Bracket {
  let result = bracket;

  for (const match of result.matches) {
    result = resolveSingleBye(result, match);
  }

  return result;
}

function createMatch(
  round: number,
  position: number,
  teamA: Slot = { type: 'pending' },
  teamB: Slot = { type: 'pending' },
): Match {
  return {
    id: crypto.randomUUID(),
    round,
    position,
    teamA,
    teamB,
    scoreA: null,
    scoreB: null,
    winner: null,
    nextMatchId: null,
    nextSlot: null,
  };
}

function linkMatches(matches: Match[], totalRounds: number): Match[] {
  const rounds: Record<number, Match[]> = {};

  for (const m of matches) {
    if (!rounds[m.round]) rounds[m.round] = [];
    rounds[m.round].push(m);
  }

  const updated = [...matches];

  for (let round = 1; round < totalRounds; round++) {
    const current = rounds[round];
    const next = rounds[round + 1];

    for (let i = 0; i < current.length; i++) {
      const parent = current[i];
      const nextMatch = next[Math.floor(i / 2)];

      const idx = updated.findIndex((m) => m.id === parent.id);

      updated[idx] = {
        ...parent,
        nextMatchId: nextMatch.id,
        nextSlot: i % 2 === 0 ? 'A' : 'B',
      };
    }
  }

  return updated;
}

function normalizeAndSortTeams(teams: Team[]): Team[] {
  const seeded = teams
    .filter((t) => t.seed != null)
    .sort((a, b) => a.seed! - b.seed!);

  const unseeded = teams.filter((t) => t.seed == null);

  const all = [...seeded, ...unseeded];

  return all.map((t, i) => ({
    ...t,
    seed: i + 1,
  }));
}

function generateSeedingSlots(size: number): number[] {
  if (size === 2) return [1, 2];

  const prev = generateSeedingSlots(size / 2);
  const result: number[] = [];

  for (const v of prev) {
    result.push(v, size + 1 - v);
  }

  return result;
}

function nextPowerOfTwo(n: number): number {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}
