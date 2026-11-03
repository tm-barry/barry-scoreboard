// interfaces/scoreboard.ts
import type { SportType } from './common';

export type ScoreboardMap = {
  generic: GenericScoreboard;
  baseball: BaseballScoreboard;
  basketball: BasketballScoreboard;
  football: FootballScoreboard;
};

export type Scoreboard = ScoreboardMap[SportType];

interface ScoreboardTimer {
  segmentDuration: number;
  timeRemaining: number;
}

interface BaseScoreboard<T extends SportType> {
  type: T;
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

export interface BaseballBases {
  first: boolean;
  second: boolean;
  third: boolean;
}

export interface BaseballScoreboard extends BaseScoreboard<'baseball'> {
  halfInning: 'top' | 'bottom'; // fixed typo: was 'bottom;'
  balls: number;
  strikes: number;
  outs: number;
  bases: BaseballBases;
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

export interface FootballScoreboard extends BaseScoreboard<'football'> {
  down: number; // 1-4
  toGo: number; // yards
  ballOn: number; // yard line (not displayed yet)
  timeoutsA: number; // 0-3
  timeoutsB: number; // 0-3
  possession: 'A' | 'B' | null;
}
