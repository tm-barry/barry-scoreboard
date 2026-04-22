import { createRouter, createWebHistory } from 'vue-router';
import { useBracketStore } from './stores/bracket';

import HomeView from './views/HomeView.vue';
import BracketView from './views/bracket/BracketView.vue';
import BracketCreate from './views/bracket/BracketCreate.vue';
import BracketManage from './views/bracket/BracketManage.vue';
import ScoreboardView from './views/scoreboard/ScoreboardView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/bracket',
    name: 'bracket',
    component: BracketView,
  },
  {
    path: '/bracket/create',
    name: 'bracket-create',
    component: BracketCreate,
  },
  {
    path: '/bracket/manage',
    name: 'bracket-manage',
    component: BracketManage,
    beforeEnter: () => {
      const store = useBracketStore();

      if (!store.currentBracket) {
        return { name: 'bracket' };
      }
    },
  },
  {
    path: '/scoreboard',
    name: 'scoreboard',
    component: ScoreboardView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
