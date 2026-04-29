<template>
  <div class="scoreboard-view">
    <!-- Intro -->
    <section class="intro">
      <h2>
        <Icon name="monitor" :size="18" />
        Scoreboard
      </h2>
      <p>Select a sport to start a scoreboard session.</p>
    </section>

    <!-- Cards -->
    <section class="cards">
      <div
        :to="{ name: 'scoreboard-play' }"
        class="card scoreboard-item"
        @click="createScoreboard('generic')"
      >
        <h3><Icon name="trophy" />Generic</h3>
        <p>Generic scoreboard with timer and scoring.</p>
      </div>

      <!-- <div
        :to="{ name: 'scoreboard-play' }"
        class="card scoreboard-item"
        @click="createScoreboard('baseball')"
      >
        <h3><Icon name="baseball" />Baseball</h3>
        <p>Runs, balls, strikes, outs, and inning tracking.</p>
      </div> -->

      <div
        :to="{ name: 'scoreboard-play' }"
        class="card scoreboard-item"
        @click="createScoreboard('basketball')"
      >
        <h3><Icon name="basketball" />Basketball</h3>
        <p>Timer, fouls, possession, and score tracking.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useScoreboardStore } from '../../stores/scoreboard';
import type { SportType } from '../../interfaces/common';

const router = useRouter();
const scoreboardStore = useScoreboardStore();

async function createScoreboard(sport: SportType) {
  scoreboardStore.setNewScoreboard(sport);
  router.push({ name: 'scoreboard-play' });
}
</script>

<style scoped>
.scoreboard-view {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

/* Intro */
.intro {
  text-align: center;
  margin-bottom: 32px;
}

.intro h2 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.intro p {
  opacity: 0.8;
  line-height: 1.5;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.card h3 {
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 8px;
  margin: 0;
}

.scoreboard-item {
  cursor: pointer;
}
</style>
