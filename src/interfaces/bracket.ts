import type { SportType } from './common';
import type { Scoreboard } from './scoreboard';

export interface Bracket {
  id: string;
  sport: SportType;
  name: string;
  teams: Team[];
  matches: Match[];
  createdAt: number;
  updatedAt: number;
}

export interface Team {
  id: string;
  name: string;
  seed?: number;
}

export interface TeamSlot {
  type: 'team';
  id: string;
}

export interface ByeSlot {
  type: 'bye';
}

export interface PendingSlot {
  type: 'pending';
}

export type Slot = TeamSlot | ByeSlot | PendingSlot;

export interface Match {
  id: string;
  round: number;
  position: number;
  teamA: Slot;
  teamB: Slot;
  score: Scoreboard | null;
  winner: TeamSlot | null;
  nextMatchId: string | null;
  nextSlot: 'A' | 'B' | null;
}
