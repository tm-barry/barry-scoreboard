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
          <span class="value sport">{{ savedScoreboard.type }}</span>
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
      <button
        v-for="sport in sports"
        :key="sport.type"
        type="button"
        class="card scoreboard-item"
        @click="createScoreboard(sport.type)"
      >
        <Icon :name="sport.icon" :size="48" class="sport-icon" />
        <div class="sport-text">
          <h3>{{ sport.label }}</h3>
          <p>{{ sport.description }}</p>
        </div>
      </button>
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

// NOTE: 'baseball' and 'football' must exist in your Icon component's icon map.
const sports: {
  type: SportType;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    type: 'generic',
    label: 'Generic',
    icon: 'trophy',
    description: 'Generic scoreboard with timer and scoring.',
  },
  {
    type: 'baseball',
    label: 'Baseball',
    icon: 'baseball',
    description: 'Innings, balls, strikes, outs, and runners on base.',
  },
  {
    type: 'basketball',
    label: 'Basketball',
    icon: 'basketball',
    description: 'Timer, fouls, possession, and score tracking.',
  },
  {
    type: 'football',
    label: 'Football',
    icon: 'football',
    description: 'Timer, down & distance, possession, and timeouts.',
  },
];

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

.value.sport {
  text-transform: capitalize;
}

.scoreboard-view {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

/* Cards */
.cards {
  display: grid;
  grid-template-columns: repeat(
    2,
    minmax(0, 1fr)
  ); /* minmax(0,…) lets cards shrink instead of overflowing */
  gap: 16px;
  max-width: 640px;
  margin: 0 auto;
}

.scoreboard-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 16px;
  text-align: center;
  cursor: pointer;
  font: inherit;
  color: inherit;
}

.sport-icon {
  flex: 0 0 auto;
}

.sport-text h3 {
  margin: 0 0 4px;
  font-size: 20px;
}

.sport-text p {
  margin: 0;
  opacity: 0.7;
  font-size: 14px;
  line-height: 1.4;
}

/* Narrow windows: one column, horizontal rows */
@media (max-width: 520px) {
  .scoreboard-view {
    padding: 16px;
  }

  .cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .scoreboard-item {
    flex-direction: row;
    align-items: center;
    gap: 16px;
    padding: 16px;
    text-align: left;
  }
}
</style>
