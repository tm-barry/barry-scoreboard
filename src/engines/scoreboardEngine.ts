import type { SportType } from '../interfaces/common';
import type { Scoreboard } from '../interfaces/scoreboard';
import { createBaseballDefaults, createFootballDefaults } from './sportsEngine';

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
        ...createBaseballDefaults(), // halfInning: 'top', balls/strikes/outs: 0, bases all false
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

    case 'football': {
      const { down, toGo, ballOn, possession, timeoutsA, timeoutsB } =
        createFootballDefaults();
      return {
        ...base,
        type,
        down,
        toGo,
        ballOn,
        possession,
        timeoutsA,
        timeoutsB,
      };
    }

    case 'generic':
    default:
      return {
        ...base,
        type: 'generic',
      };
  }
}
