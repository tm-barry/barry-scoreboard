import { defineStore } from 'pinia';
import type { Bracket } from '../interfaces/bracket';
import { deleteBracket, saveBracket, getAllBrackets } from '../db/indexedDb';

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

      await saveBracket(this.currentBracket);

      // keep local list in sync
      const index = this.brackets.findIndex(
        (b) => b.id === this.currentBracket!.id,
      );

      if (index === -1) {
        this.brackets.push(this.currentBracket);
      } else {
        this.brackets[index] = this.currentBracket;
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
  },
});
