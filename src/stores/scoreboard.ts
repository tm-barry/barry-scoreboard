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

    incrementTeamScore(team: 'A' | 'B', incrementBy: number = 1) {
      if (!this.scoreboard) return;

      const score =
        (team === 'A' ? this.scoreboard.scoreA : this.scoreboard.scoreB) ?? 0;

      this.setTeamScore(team, (score ?? 0) + incrementBy);
    },

    decrementTeamScore(team: 'A' | 'B', incrementBy: number = 1) {
      if (!this.scoreboard) return;

      const score =
        (team === 'A' ? this.scoreboard.scoreA : this.scoreboard.scoreB) ?? 0;

      if (score > 0) this.setTeamScore(team, (score ?? 0) - incrementBy);
    },
  },
});
