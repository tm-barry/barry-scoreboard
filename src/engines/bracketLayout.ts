import type { Match } from '../interfaces/bracket';

export interface Point {
  x: number;
  y: number;
}

export interface MatchLayout {
  matchId: string;
  x: number;
  y: number;

  // connection anchors
  left: Point;
  right: Point;
}

export interface BracketLayout {
  matchLayouts: Map<string, MatchLayout>;
  width: number;
  height: number;
}

// Constants
export const MATCH_WIDTH = 275;
export const TEAM_HEIGHT = 64;
export const MATCH_HEIGHT = TEAM_HEIGHT * 2;
export const ROUND_GAP = 120;
export const MATCH_GAP = 36;
export const TEAM_GAP = 10;

export function computeBracketLayout(matches: Match[]): BracketLayout {
  const childrenMap = buildChildrenMap(matches);
  const rounds = groupByRound(matches);
  const maxRound = Math.max(...rounds.keys());
  const layouts = new Map<string, MatchLayout>();
  let yCursor = 0;

  for (const match of rounds.get(1) ?? []) {
    const layout = createLayout(match.id, 0, yCursor);
    layouts.set(match.id, layout);

    yCursor += MATCH_HEIGHT + MATCH_GAP;
  }

  for (let round = 2; round <= maxRound; round++) {
    const matches = rounds.get(round) ?? [];

    for (const match of matches) {
      const childrenIds = childrenMap.get(match.id) ?? [];

      const childLayouts = childrenIds
        .map((id) => layouts.get(id))
        .filter(Boolean) as MatchLayout[];

      if (!childLayouts.length) continue;

      const avgY =
        childLayouts.reduce((sum, c) => sum + c.y, 0) / childLayouts.length;

      const x = (round - 1) * (MATCH_WIDTH + ROUND_GAP);

      const layout = createLayout(match.id, x, avgY);
      layouts.set(match.id, layout);
    }
  }

  const values = [...layouts.values()];

  return {
    matchLayouts: layouts,
    width: maxRound * MATCH_WIDTH + (maxRound - 1) * ROUND_GAP,
    height: Math.max(...values.map((v) => v.y)) + MATCH_HEIGHT,
  };
}

function createLayout(id: string, x: number, y: number): MatchLayout {
  return {
    matchId: id,
    x,
    y,
    left: {
      x,
      y: y + (MATCH_HEIGHT + TEAM_GAP) / 2,
    },
    right: {
      x: x + MATCH_WIDTH,
      y: y + (MATCH_HEIGHT + TEAM_GAP) / 2,
    },
  };
}

function buildChildrenMap(matches: Match[]) {
  const map = new Map<string, string[]>();

  for (const m of matches) {
    if (!m.nextMatchId) continue;

    if (!map.has(m.nextMatchId)) {
      map.set(m.nextMatchId, []);
    }

    map.get(m.nextMatchId)!.push(m.id);
  }

  return map;
}

function groupByRound(matches: Match[]) {
  const map = new Map<number, Match[]>();

  for (const m of matches) {
    if (!map.has(m.round)) map.set(m.round, []);
    map.get(m.round)!.push(m);
  }

  return map;
}

export function computeEdges(
  matches: Match[],
  layout: Map<string, MatchLayout>,
) {
  const edges: { d: string }[] = [];

  for (const match of matches) {
    if (!match.nextMatchId) continue;

    const from = layout.get(match.id);
    const to = layout.get(match.nextMatchId);

    if (!from || !to) continue;

    const start = from.right;
    const end = to.left;

    const midX = start.x + (end.x - start.x) * 0.5;

    const d = `
      M ${start.x} ${start.y}
      L ${midX} ${start.y}
      L ${midX} ${end.y}
      L ${end.x} ${end.y}
    `;

    edges.push({ d });
  }

  return edges;
}
