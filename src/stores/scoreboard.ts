import { defineStore } from 'pinia';
import type { Scoreboard } from '../interfaces/scoreboard';
import type { SportType } from '../interfaces/common';
import { createScoreboard } from '../engines/scoreboardEngine';
import * as sports from '../engines/sportsEngine';
import {
  deleteScoreboard,
  getBracket,
  getScoreboard,
  saveScoreboard,
} from '../db/indexedDb';
import type { TeamSlot } from '../interfaces/bracket';

let saveTimer: ReturnType<typeof setTimeout> | null = null;

/** Fill in fields added after a scoreboard was saved (older baseball boards have no `bases`). */
function normalizeScoreboard(sb: Scoreboard): Scoreboard {
  if (sb.type === 'baseball' && !sb.bases) {
    sb.bases = { first: false, second: false, third: false };
  }
  return sb;
}

export const useScoreboardStore = defineStore('scoreboard', {
  state: () => ({
    scoreboard: null as Scoreboard | null,
  }),

  getters: {
    hasBracketMatch: (state) =>
      !!state.scoreboard?.bracketId && !!state.scoreboard?.matchId,
  },

  actions: {
    async loadScoreboard(): Promise<Scoreboard | undefined> {
      const sb = await getScoreboard();
      return sb ? normalizeScoreboard(sb) : undefined;
    },

    async saveCurrentScoreboard() {
      if (!this.scoreboard) return;
      await saveScoreboard(this.scoreboard);
    },

    queueSave(delay = 300) {
      if (saveTimer) clearTimeout(saveTimer);

      saveTimer = setTimeout(async () => {
        if (!this.scoreboard) return;
        await saveScoreboard(this.scoreboard);
      }, delay);
    },

    async deleteCurrentScoreboard() {
      this.scoreboard = null;
      await deleteScoreboard();
    },

    applyChange(fn: () => void, persist = true) {
      if (!this.scoreboard) return;

      fn();

      if (persist) {
        this.queueSave();
      }
    },

    setNewScoreboard(sport: SportType) {
      this.scoreboard = createScoreboard(sport);
      this.queueSave();
    },

    async setBracketMatchScoreboard(
      bracketId: string,
      matchId: string,
    ): Promise<boolean> {
      const bracket = await getBracket(bracketId);
      const match = bracket?.matches.find((m) => m.id === matchId);

      if (!bracket || !match) return false;

      const resolveTeam = (slot: TeamSlot) =>
        bracket.teams.find((t) => t.id === slot.id);

      const teamA = resolveTeam(match.teamA as TeamSlot);
      const teamB = resolveTeam(match.teamB as TeamSlot);

      if (!teamA || !teamB) return false;

      this.scoreboard = createScoreboard(bracket.sport);
      this.scoreboard.teamA = teamA.name;
      this.scoreboard.teamB = teamB.name;
      this.scoreboard.bracketId = bracketId;
      this.scoreboard.matchId = matchId;

      this.queueSave();
      return true;
    },

    setTeamScore(team: 'A' | 'B', score: number | null) {
      this.applyChange(() => {
        if (!this.scoreboard) return;

        if (team === 'A') this.scoreboard.scoreA = score;
        else this.scoreboard.scoreB = score;
      });
    },

    adjustTeamScore(team: 'A' | 'B', delta = 1) {
      this.applyChange(() => {
        if (!this.scoreboard) return;

        const current =
          team === 'A' ? this.scoreboard.scoreA : this.scoreboard.scoreB;

        const next = Math.max(0, (current ?? 0) + delta);

        if (team === 'A') this.scoreboard.scoreA = next;
        else this.scoreboard.scoreB = next;
      });
    },

    setSegment(value: number) {
      this.applyChange(() => {
        if (!this.scoreboard) return;
        this.scoreboard.segment = value;
      });
    },

    adjustSegment(delta = 1) {
      this.applyChange(() => {
        if (!this.scoreboard) return;

        const next = Math.max(1, this.scoreboard.segment + delta);
        this.scoreboard.segment = next;
      });
    },

    // --------------------------------------------------
    // Shared: basketball + football possession
    // --------------------------------------------------

    setPossession(team: 'A' | 'B') {
      this.applyChange(() => {
        const sb = this.scoreboard;
        if (sb?.type === 'basketball') {
          sb.possession = team;
        } else if (sb?.type === 'football') {
          // A change of possession starts a fresh 1st & 10
          if (sb.possession !== team) sports.changePossession(sb, team);
        }
      });
    },

    // --------------------------------------------------
    // Basketball
    // --------------------------------------------------

    setTeamFouls(team: 'A' | 'B', fouls: number) {
      this.applyChange(() => {
        if (this.scoreboard?.type !== 'basketball') return;

        if (team === 'A') this.scoreboard.foulsA = fouls;
        else this.scoreboard.foulsB = fouls;
      });
    },

    adjustTeamFouls(team: 'A' | 'B', delta = 1) {
      this.applyChange(() => {
        if (this.scoreboard?.type !== 'basketball') return;

        const current =
          team === 'A' ? this.scoreboard.foulsA : this.scoreboard.foulsB;

        const next = Math.max(0, current + delta);

        if (team === 'A') this.scoreboard.foulsA = next;
        else this.scoreboard.foulsB = next;
      });
    },

    // --------------------------------------------------
    // Baseball
    // --------------------------------------------------

    adjustBalls(delta = 1) {
      this.applyChange(() => {
        if (this.scoreboard?.type !== 'baseball') return;
        sports.adjustBalls(this.scoreboard, delta);
      });
    },

    adjustStrikes(delta = 1) {
      this.applyChange(() => {
        if (this.scoreboard?.type !== 'baseball') return;
        sports.adjustStrikes(this.scoreboard, delta);
      });
    },

    adjustOuts(delta = 1) {
      this.applyChange(() => {
        if (this.scoreboard?.type !== 'baseball') return;
        sports.adjustOuts(this.scoreboard, delta);
      });
    },

    toggleBase(base: 'first' | 'second' | 'third') {
      this.applyChange(() => {
        if (this.scoreboard?.type !== 'baseball') return;
        sports.toggleBase(this.scoreboard, base);
      });
    },

    setInningHalf(half: 'top' | 'bottom') {
      this.applyChange(() => {
        if (this.scoreboard?.type !== 'baseball') return;
        this.scoreboard.halfInning = half;
      });
    },

    // --------------------------------------------------
    // Football
    // --------------------------------------------------

    adjustDown(delta = 1) {
      this.applyChange(() => {
        if (this.scoreboard?.type !== 'football') return;
        sports.adjustDown(this.scoreboard, delta);
      });
    },

    adjustToGo(delta = 1) {
      this.applyChange(() => {
        if (this.scoreboard?.type !== 'football') return;
        sports.adjustToGo(this.scoreboard, delta);
      });
    },

    firstDown() {
      this.applyChange(() => {
        if (this.scoreboard?.type !== 'football') return;
        sports.firstDown(this.scoreboard);
      });
    },

    adjustTimeouts(team: 'A' | 'B', delta = 1) {
      this.applyChange(() => {
        if (this.scoreboard?.type !== 'football') return;
        sports.adjustTimeouts(this.scoreboard, team, delta);
      });
    },
  },
});
