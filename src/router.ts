import { createRouter, createWebHistory } from 'vue-router';

import HomeView from './views/HomeView.vue';
import BracketView from './views/BracketView.vue';
import LeaderboardView from './views/LeaderboardView.vue';
import ScoreboardView from './views/ScoreboardView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/bracket',
    name: 'bracket',
    component: BracketView
  },
  {
    path: '/leaderboard',
    name: 'leaderboard',
    component: LeaderboardView
  },
  {
    path: '/scoreboard',
    name: 'scoreboard',
    component: ScoreboardView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
