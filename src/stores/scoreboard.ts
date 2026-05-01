import { defineStore } from 'pinia';
import type { Scoreboard } from '../interfaces/scoreboard';
import type { SportType } from '../interfaces/common';
import { createScoreboard } from '../engines/scoreboardEngine';
import {
  deleteScoreboard,
  getBracket,
  getScoreboard,
  saveScoreboard,
} from '../db/indexedDb';
import type { TeamSlot } from '../interfaces/bracket';

let saveTimer: ReturnType<typeof setTimeout> | null = null;

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
      return await getScoreboard();
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

    async setBracketMatchScoreboard(bracketId: string, matchId: string) {
      const bracket = await getBracket(bracketId);
      const match = bracket?.matches.find((m) => m.id === matchId);

      if (!bracket || !match) return;

      const resolveTeam = (slot: TeamSlot) =>
        bracket.teams.find((t) => t.id === slot.id);

      const teamA = resolveTeam(match.teamA as TeamSlot);
      const teamB = resolveTeam(match.teamB as TeamSlot);

      if (!teamA || !teamB) return;

      this.scoreboard = createScoreboard(bracket.sport);
      this.scoreboard.teamA = teamA.name;
      this.scoreboard.teamB = teamB.name;
      this.scoreboard.bracketId = bracketId;
      this.scoreboard.matchId = matchId;

      this.queueSave();
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
    // Basketball
    // --------------------------------------------------

    setPossession(team: 'A' | 'B') {
      this.applyChange(() => {
        if (this.scoreboard?.type !== 'basketball') return;
        this.scoreboard.possession = team;
      });
    },

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
  },
});
