export interface Bracket {
  id: string;
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

export interface Match {
  id: string;
  round: number;
  position: number;
  complete: boolean;

  teamAId: string | null;
  teamBId: string | null;

  scoreA: number | null;
  scoreB: number | null;

  winnerId: string | null;

  nextMatchId: string | null;
  nextSlot: 'A' | 'B' | null;
}
