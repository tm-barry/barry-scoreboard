<template>
  <div class="home">
    <!-- Intro -->
    <section class="intro">
      <img src="../assets/barryscoreboard.svg" alt="Logo" class="logo" />
      <h1>BarryScoreboard</h1>
      <p>
        A simple PWA app for managing brackets, tracking scores, and managing
        leaderboards.
      </p>
    </section>

    <!-- Navigation cards -->
    <section class="cards">
      <router-link to="/bracket" class="card">
        <h2><Network :size="18" class="rotate-90" />Bracket</h2>
        <p>Create, manage, save, and load tournament brackets.</p>
      </router-link>

      <router-link to="/leaderboard" class="card">
        <h2><ListOrdered :size="18" />Leaderboard</h2>
        <p>Track scores and standings in a leaderboard.</p>
      </router-link>

      <router-link to="/scoreboard" class="card">
        <h2><Monitor :size="18" />Scoreboard</h2>
        <p>View and update live match scores in real time.</p>
      </router-link>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ListOrdered, Monitor, Network } from '@lucide/vue';
</script>

<style scoped>
.home {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

/* Intro */
.intro {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 96px;
  height: 96px;
}

.intro p {
  opacity: 0.8;
  line-height: 1.5;
}

/* Cards */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

/* Card styling */
.card {
  display: block;
  padding: 18px;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;

  background: var(--card-bg);
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);

  transition:
    transform 0.15s ease,
    background 0.15s ease;
}

.card:hover {
  transform: translateY(-3px);
  background: var(--card-hover-bg);
}

.card h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.card p {
  font-size: 0.9rem;
  opacity: 0.75;
}
</style>
