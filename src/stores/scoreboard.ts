import { defineStore } from 'pinia';
import type { Scoreboard } from '../interfaces/scoreboard';
import type { SportType } from '../interfaces/common';
import { createScoreboard } from '../engines/scoreboardEngine';

export const useScoreboardStore = defineStore('scoreboard', {
  state: () => ({
    scoreboard: null as Scoreboard | null,
  }),

  getters: {
    hasBracketMatch: (state) =>
      !!state.scoreboard?.bracketId && !!state.scoreboard?.matchId,
  },

  actions: {
    async loadScoreboard() {
      // TODO - load saved manual scoreboard from indexedDb
    },

    async saveScoreboard() {
      if (!this.scoreboard) return;

      // TODO - save
    },

    async deleteScoreboard() {
      // TODO - delete saved manual scoreboard from indexedDb
    },

    setNewScoreboard(sport: SportType) {
      this.scoreboard = createScoreboard(sport);
    },

    setBracketMatchScoreboard(bracketId: string, matchId: string) {
      console.info(bracketId, matchId);
      // TODO - get scoreboard from bracket store by bracketId and matchId
    },

    clearScoreboard() {
      this.scoreboard = null;
    },

    setTeamScore(team: 'A' | 'B', score: number | null) {
      if (!this.scoreboard) return;

      switch (team) {
        case 'A':
          this.scoreboard.scoreA = score;
          break;
        case 'B':
          this.scoreboard.scoreB = score;
      }
    },

    adjustTeamScore(team: 'A' | 'B', delta: number = 1) {
      if (!this.scoreboard) return;

      const current =
        (team === 'A' ? this.scoreboard.scoreA : this.scoreboard.scoreB) ?? 0;

      const next = Math.max(0, current + delta);

      this.setTeamScore(team, next);
    },

    setSegment(value: number) {
      if (!this.scoreboard) return;

      this.scoreboard.segment = value;
    },

    adjustSegment(delta: number = 1) {
      if (!this.scoreboard) return;

      const current = this.scoreboard.segment;

      const next = Math.max(1, current + delta);

      this.setSegment(next);
    },

    setPossession(team: 'A' | 'B') {
      if (this.scoreboard?.type !== 'basketball') return;

      this.scoreboard.possession = team;
    },

    setTeamFouls(team: 'A' | 'B', fouls: number) {
      if (this.scoreboard?.type !== 'basketball') return;

      switch (team) {
        case 'A':
          this.scoreboard.foulsA = fouls;
          break;
        case 'B':
          this.scoreboard.foulsB = fouls;
      }
    },

    adjustTeamFouls(team: 'A' | 'B', delta: number) {
      if (this.scoreboard?.type !== 'basketball') return;

      const current =
        team === 'A' ? this.scoreboard.foulsA : this.scoreboard.foulsB;

      const next = Math.max(0, current + delta);

      this.setTeamFouls(team, next);
    },
  },
});
