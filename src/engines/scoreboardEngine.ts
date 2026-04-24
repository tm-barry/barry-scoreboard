import type { SportType } from '../interfaces/common';
import type { Scoreboard } from '../interfaces/scoreboard';

export function createScoreboard(type: SportType): Scoreboard {
  const base = {
    segmentsTotal: 1,
    segment: 1,
    scoreA: null,
    scoreB: null,
    teamA: null,
    teamB: null,
  };

  switch (type) {
    case 'baseball':
      return {
        ...base,
        type,
        halfInning: 'top',
        balls: 0,
        strikes: 0,
        outs: 0,
      };

    case 'basketball':
      return {
        ...base,
        type,
        timeoutsA: 0,
        timeoutsB: 0,
        foulsA: 0,
        foulsB: 0,
        bonusA: 'none',
        bonusB: 'none',
        possession: null,
      };

    case 'generic':
    default:
      return {
        ...base,
        type: 'generic',
      };
  }
}
