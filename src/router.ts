import { createRouter, createWebHistory } from 'vue-router';

import HomeView from './views/HomeView.vue';
import BracketView from './views/bracket/BracketView.vue';
import BracketCreate from './views/bracket/BracketCreate.vue';
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
