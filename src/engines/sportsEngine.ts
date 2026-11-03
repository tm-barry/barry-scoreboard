// engines/sportsEngine.ts
// Pure game-rule helpers. They mutate the scoreboard object passed in (which is
// reactive state inside the Pinia store), so the store just calls these and then queueSave().

export type TeamSide = 'A' | 'B';

// ---------------------------------------------------------------
// Baseball
// ---------------------------------------------------------------
export interface BaseballState {
  segment?: number; // inning (already on your base scoreboard)
  balls: number; // 0-3
  strikes: number; // 0-2
  outs: number; // 0-2
  halfInning: 'top' | 'bottom';
  bases: { first: boolean; second: boolean; third: boolean };
}

export function createBaseballDefaults(): Pick<
  BaseballState,
  'balls' | 'strikes' | 'outs' | 'halfInning' | 'bases'
> {
  return {
    balls: 0,
    strikes: 0,
    outs: 0,
    halfInning: 'top',
    bases: { first: false, second: false, third: false },
  };
}

export function resetCount(sb: BaseballState) {
  sb.balls = 0;
  sb.strikes = 0;
}

export function endHalfInning(sb: BaseballState) {
  resetCount(sb);
  sb.outs = 0;
  sb.bases = { first: false, second: false, third: false };
  if (sb.halfInning === 'top') {
    sb.halfInning = 'bottom';
  } else {
    sb.halfInning = 'top';
    sb.segment = (sb.segment ?? 1) + 1;
  }
}

export function adjustOuts(sb: BaseballState, delta: number) {
  if (delta < 0) {
    sb.outs = Math.max(0, sb.outs + delta);
    return;
  }
  sb.outs += delta;
  if (sb.outs >= 3) endHalfInning(sb);
  else resetCount(sb); // new batter
}

export function adjustStrikes(sb: BaseballState, delta: number) {
  if (delta < 0) {
    sb.strikes = Math.max(0, sb.strikes + delta);
    return;
  }
  sb.strikes += delta;
  if (sb.strikes >= 3) adjustOuts(sb, 1); // strikeout (also clears the count)
}

export function adjustBalls(sb: BaseballState, delta: number) {
  if (delta < 0) {
    sb.balls = Math.max(0, sb.balls + delta);
    return;
  }
  sb.balls += delta;
  if (sb.balls >= 4) resetCount(sb); // walk: runner advance is set by hand on the diamond
}

export function toggleBase(
  sb: BaseballState,
  base: 'first' | 'second' | 'third',
) {
  sb.bases[base] = !sb.bases[base];
}

// ---------------------------------------------------------------
// Football
// ---------------------------------------------------------------
export interface FootballState {
  down: number; // 1-4
  toGo: number; // yards
  ballOn: number; // yard line, 1-99 measured from Team A's goal line (optional display)
  possession: TeamSide | null;
  timeoutsA: number; // 0-3
  timeoutsB: number; // 0-3
}

export const FOOTBALL_MAX_TIMEOUTS = 3;

export function createFootballDefaults(): FootballState {
  return {
    down: 1,
    toGo: 10,
    ballOn: 25,
    possession: null,
    timeoutsA: FOOTBALL_MAX_TIMEOUTS,
    timeoutsB: FOOTBALL_MAX_TIMEOUTS,
  };
}

export function adjustDown(sb: FootballState, delta: number) {
  // wraps 1 -> 4 -> 1 so a single tap button cycles through downs
  sb.down = ((sb.down - 1 + delta + 4) % 4) + 1;
}

export function adjustToGo(sb: FootballState, delta: number) {
  sb.toGo = Math.min(99, Math.max(0, sb.toGo + delta));
}

export function firstDown(sb: FootballState) {
  sb.down = 1;
  sb.toGo = 10;
}

export function adjustTimeouts(
  sb: FootballState,
  team: TeamSide,
  delta: number,
) {
  const key = team === 'A' ? 'timeoutsA' : 'timeoutsB';
  sb[key] = Math.min(FOOTBALL_MAX_TIMEOUTS, Math.max(0, sb[key] + delta));
}

/** Flip possession and reset to 1st & 10 */
export function changePossession(sb: FootballState, team: TeamSide) {
  sb.possession = team;
  firstDown(sb);
}
