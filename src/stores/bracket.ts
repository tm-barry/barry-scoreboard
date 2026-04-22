import { defineStore } from 'pinia';
import type { Bracket } from '../interfaces/bracket';

export const useBracketStore = defineStore('bracket', {
  state: () => ({
    currentBracket: null as Bracket | null,
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
  },
});
