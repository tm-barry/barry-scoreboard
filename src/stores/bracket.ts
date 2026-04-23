import { defineStore } from 'pinia';
import type { Bracket } from '../interfaces/bracket';
import { deleteBracket, saveBracket, getAllBrackets } from '../db/indexedDb';
import {
  setMatchWinner as applyWinner,
  unsetMatchWinner as unsetWinner,
} from '../engines/bracketEngine';

export const useBracketStore = defineStore('bracket', {
  state: () => ({
    currentBracket: null as Bracket | null,
    brackets: [] as Bracket[],
  }),

  getters: {
    hasCurrentBracket: (state) => !!state.currentBracket,
  },

  actions: {
    setCurrentBracket(bracket: Bracket | null) {
      this.currentBracket = bracket;
    },

    clearCurrentBracket() {
      this.currentBracket = null;
    },

    async loadBrackets() {
      this.brackets = await getAllBrackets();
    },

    async saveCurrent() {
      if (!this.currentBracket) return;

      const updated = touch(this.currentBracket);
      this.currentBracket = updated;

      await saveBracket(updated);

      const index = this.brackets.findIndex((b) => b.id === updated.id);

      if (index === -1) {
        this.brackets.push(updated);
      } else {
        this.brackets[index] = updated;
      }
    },

    async deleteBracket(id: string) {
      await deleteBracket(id);

      // keep local list in sync
      this.brackets = this.brackets.filter((b) => b.id !== id);

      // clear current if deleted
      if (this.currentBracket?.id === id) {
        this.currentBracket = null;
      }
    },

    async setMatchWinner(matchId: string, teamId: string) {
      if (!this.currentBracket) return;

      let updated = applyWinner(this.currentBracket, matchId, teamId);
      updated = touch(updated);
      this.currentBracket = updated;

      await saveBracket(updated);
    },

    async unsetMatchWinner(matchId: string) {
      if (!this.currentBracket) return;

      let updated = unsetWinner(this.currentBracket, matchId);
      updated = touch(updated);

      this.currentBracket = updated;

      await saveBracket(updated);
    },
  },
});

function touch(bracket: Bracket): Bracket {
  return {
    ...bracket,
    updatedAt: Date.now(),
  };
}
