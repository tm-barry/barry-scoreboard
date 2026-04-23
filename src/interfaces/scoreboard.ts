// scoreboard.ts
import type { SportType } from './common';

export type ScoreboardMap = {
  generic: GenericScoreboard;
  baseball: BaseballScoreboard;
  basketball: BasketballScoreboard;
};

export type Scoreboard = ScoreboardMap[SportType];

interface BaseScoreboard<T extends SportType> {
  type: T;
  timer: number | null;
  segment: number | null;
  scoreA: number | null;
  scoreB: number | null;
}

export type GenericScoreboard = BaseScoreboard<'generic'>;

export interface BaseballScoreboard extends BaseScoreboard<'baseball'> {
  balls: number;
  strikes: number;
  outs: number;
}

export interface BasketballScoreboard extends BaseScoreboard<'basketball'> {
  timeoutsA: number;
  timeoutsB: number;
  foulsA: number;
  foulsB: number;
  possession: 'A' | 'B' | null;
  shotClock: number | null;
}
