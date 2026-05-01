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

    <!-- Resume Card -->
    <section v-if="savedScoreboard" class="resume">
      <h3 class="resume-title">Resume Last Session</h3>

      <div class="card" @click="resumeScoreboard">
        <div class="resume-row">
          <span class="label">Sport</span>
          <span class="value">{{ savedScoreboard.type }}</span>
        </div>

        <div class="resume-row">
          <span class="label">Match</span>
          <span class="value">
            {{ savedScoreboard.teamA || 'Team A' }} vs
            {{ savedScoreboard.teamB || 'Team B' }}
          </span>
        </div>

        <div class="resume-row">
          <span class="label">Score</span>
          <span class="value">
            {{ savedScoreboard.scoreA ?? 0 }} -
            {{ savedScoreboard.scoreB ?? 0 }}
          </span>
        </div>
      </div>
    </section>

    <!-- Cards -->
    <section class="cards">
      <div class="card scoreboard-item" @click="createScoreboard('generic')">
        <h3><Icon name="trophy" />Generic</h3>
        <p>Generic scoreboard with timer and scoring.</p>
      </div>

      <div class="card scoreboard-item" @click="createScoreboard('basketball')">
        <h3><Icon name="basketball" />Basketball</h3>
        <p>Timer, fouls, possession, and score tracking.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useScoreboardStore } from '../../stores/scoreboard';
import type { Scoreboard } from '../../interfaces/scoreboard';
import type { SportType } from '../../interfaces/common';

const router = useRouter();
const scoreboardStore = useScoreboardStore();

const savedScoreboard = ref<Scoreboard | undefined>(undefined);

onMounted(async () => {
  savedScoreboard.value = await scoreboardStore.loadScoreboard();
});

function resumeScoreboard() {
  if (!savedScoreboard.value) return;

  // hydrate store
  scoreboardStore.scoreboard = savedScoreboard.value;

  router.push({ name: 'scoreboard-play' });
}

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

/* Resume */
.resume {
  margin-bottom: 24px;
}

.resume-title {
  margin-bottom: 12px;
  font-size: 16px;
  opacity: 0.8;
}

.resume-card {
  border: 1px solid var(--border-color, #333);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;
}

.resume-card:hover {
  transform: translateY(-2px);
}

.resume-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.value {
  font-weight: 500;
}

/* Cards */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.card h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.scoreboard-item {
  cursor: pointer;
}
</style>
