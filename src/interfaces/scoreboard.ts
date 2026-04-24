// scoreboard.ts
import type { SportType } from './common';

export type ScoreboardMap = {
  generic: GenericScoreboard;
  baseball: BaseballScoreboard;
  basketball: BasketballScoreboard;
};

export type Scoreboard = ScoreboardMap[SportType];

interface ScoreboardTimer {
  segmentDuration: number;
  timeRemaining: number;
}

interface BaseScoreboard<T extends SportType> {
  type: T;
  segmentsTotal: number;
  segment: number;
  timer?: ScoreboardTimer;
  teamA: string | null;
  teamB: string | null;
  scoreA: number | null;
  scoreB: number | null;
  bracketId?: string;
  matchId?: string;
}

export type GenericScoreboard = BaseScoreboard<'generic'>;

export interface BaseballScoreboard extends BaseScoreboard<'baseball'> {
  halfInning: 'top' | 'bottom;';
  balls: number;
  strikes: number;
  outs: number;
}

export type BonusState = 'none' | 'bonus' | 'double';

export interface BasketballScoreboard extends BaseScoreboard<'basketball'> {
  timeoutsA: number;
  timeoutsB: number;
  foulsA: number;
  foulsB: number;
  bonusA: BonusState;
  bonusB: BonusState;
  possession: 'A' | 'B' | null;
}
