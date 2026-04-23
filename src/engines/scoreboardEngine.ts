import type { SportType } from '../interfaces/common';
import type { Scoreboard } from '../interfaces/scoreboard';

export function createScoreboard(type: SportType): Scoreboard {
  switch (type) {
    case 'baseball':
      return {
        type,
        timer: null,
        segment: null,
        scoreA: null,
        scoreB: null,
        balls: 0,
        strikes: 0,
        outs: 0,
      };

    case 'basketball':
      return {
        type,
        timer: null,
        segment: null,
        scoreA: null,
        scoreB: null,
        timeoutsA: 0,
        timeoutsB: 0,
        foulsA: 0,
        foulsB: 0,
        possession: null,
        shotClock: null,
      };

    case 'generic':
    default:
      return {
        type: 'generic',
        timer: null,
        segment: null,
        scoreA: null,
        scoreB: null,
      };
  }
}
