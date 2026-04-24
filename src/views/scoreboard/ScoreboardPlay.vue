<template>
  <div ref="viewportRef" class="viewport">
    <div ref="scaleWrapper" class="scale-wrapper">
      <div class="canvas">
        <!-- Timer -->
        <div class="top-bar">
          <div v-if="!baseballScoreboard" class="timer">
            {{ formattedTime }}
          </div>

          <!-- Segment moved BELOW timer -->
          <div class="segment">
            <div class="segment-name">{{ segmentName }}</div>
            <div class="segment-value">
              {{ scoreboard?.segment ?? 0 }}
            </div>
          </div>
        </div>

        <!-- Main Score -->
        <div class="main">
          <!-- LEFT HALF -->
          <div class="side left">
            <div>
              <div class="team no-select" @click="incrementTeamScore('A')">
                <div class="name">
                  <span class="name-text">{{ teamAName }}</span>
                </div>
                <div class="score">{{ scoreboard?.scoreA ?? 0 }}</div>
              </div>
              <div class="score-controls">
                <button class="icon-btn" @click.stop="decrementTeamScore('A')">
                  <Minus :size="36" />
                </button>
                <button class="icon-btn" @click.stop="incrementTeamScore('A')">
                  <Plus :size="36" />
                </button>
              </div>
            </div>
          </div>

          <!-- CENTER -->
          <div class="vs">VS</div>

          <!-- RIGHT HALF -->
          <div class="side right">
            <div>
              <div class="team no-select" @click="incrementTeamScore('B')">
                <div class="name">
                  <span class="name-text">{{ teamBName }}</span>
                </div>
                <div class="score">{{ scoreboard?.scoreB ?? 0 }}</div>
              </div>
              <div class="score-controls">
                <button class="icon-btn" @click.stop="decrementTeamScore('B')">
                  <Minus :size="36" />
                </button>
                <button class="icon-btn" @click.stop="incrementTeamScore('B')">
                  <Plus :size="36" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sports Overlay -->
        <div class="overlay">
          <div v-if="baseballScoreboard" class="hud baseball">
            <div>B: {{ baseballScoreboard.balls }}</div>
            <div>S: {{ baseballScoreboard.strikes }}</div>
            <div>O: {{ baseballScoreboard.outs }}</div>
          </div>

          <div v-if="basketballScoreboard" class="hud basketball">
            <div>Fouls A: {{ basketballScoreboard.foulsA }}</div>
            <div>Fouls B: {{ basketballScoreboard.foulsB }}</div>
            <div>Possession: {{ basketballScoreboard.possession ?? '-' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onActivated, onDeactivated } from 'vue';
import { useScoreboardStore } from '../../stores/scoreboard';
import { storeToRefs } from 'pinia';
import { Plus, Minus } from '@lucide/vue';
import type {
  BaseballScoreboard,
  BasketballScoreboard,
} from '../../interfaces/scoreboard';

const BASE_W = 1280;
const BASE_H = 720;

const viewportRef = ref<HTMLElement | null>(null);
const scaleWrapper = ref<HTMLElement | null>(null);

const scoreboardStore = useScoreboardStore();
const { scoreboard } = storeToRefs(scoreboardStore);

const baseballScoreboard = computed(() =>
  scoreboard.value?.type === 'baseball'
    ? (scoreboard.value as BaseballScoreboard)
    : null,
);

const basketballScoreboard = computed(() =>
  scoreboard.value?.type === 'basketball'
    ? (scoreboard.value as unknown as BasketballScoreboard)
    : null,
);

const segmentName = computed(() => {
  switch (scoreboard.value?.type) {
    case 'baseball':
      return 'Inning';
    default:
      return 'Period';
  }
});

const teamAName = computed(() => 'Team A');
const teamBName = computed(() => 'Team B');

const formattedTime = computed(() => {
  const t = scoreboard.value?.timer?.timeRemaining ?? 0; // seconds (can be float)

  const minutes = Math.floor(t / 60);
  const seconds = Math.floor(t % 60);
  const fractional = Math.floor((t % 1) * 100);

  const base = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // show hundredths only under 10 seconds
  if (t < 10) {
    return `${base}.${fractional.toString().padStart(2, '0')}`;
  }

  return base;
});

async function incrementTeamScore(team: 'A' | 'B') {
  scoreboardStore.incrementTeamScore(team);
}

async function decrementTeamScore(team: 'A' | 'B') {
  scoreboardStore.decrementTeamScore(team);
}

let ro: ResizeObserver | null = null;

function updateScale() {
  if (!viewportRef.value || !scaleWrapper.value) return;

  const vw = viewportRef.value.clientWidth;
  const vh = viewportRef.value.clientHeight;

  const scale = Math.min(vw / BASE_W, vh / BASE_H);

  const x = (vw - BASE_W * scale) / 2;
  const y = (vh - BASE_H * scale) / 2;

  scaleWrapper.value.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
}

onActivated(() => {
  updateScale();

  ro = new ResizeObserver(updateScale);
  if (viewportRef.value) ro.observe(viewportRef.value);
});

onDeactivated(() => {
  ro?.disconnect();
  ro = null;
});
</script>

<style scoped>
.viewport {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg);
}

.scale-wrapper {
  width: 1280px;
  height: 720px;

  position: absolute;
  top: 0;
  left: 0;

  transform-origin: top left;
}

.canvas {
  width: 100%;
  height: 100%;

  display: grid;
  grid-template-rows: auto 1fr auto;

  box-sizing: border-box;
}

/* TIMER */
.top-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 40px;

  padding-top: 12px;
}

.timer {
  font-size: 128px;
  font-weight: 600;
  letter-spacing: -0.5px;
  line-height: 1;
  opacity: 0.85;
}

.segment {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 2px;
}

.segment-name {
  font-size: 36px;
  opacity: 0.65;
}

.segment-value {
  font-size: 54px;
  font-weight: 600;
  line-height: 1;
}

.main {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

/* Each side becomes a full half container */
.side {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}

/* Optional: align text directionally */
.side.left {
  justify-content: start;
}

.side.right {
  justify-content: end;
}

/* Shared team block */
.team {
  width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  cursor: pointer;
}

.name {
  width: 500px;
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.name-text {
  white-space: normal;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-align: center;
  overflow: hidden;
  font-size: 28px;
}

.score {
  font-size: 128px;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  font-variant-numeric: tabular-nums;

  min-height: 140px; /* locks vertical space */
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-controls {
  padding-top: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 30px;
  opacity: 0.35;
}

/* VS stays centered */
.vs {
  font-size: 36px;
  font-weight: 600;
  opacity: 0.25;
  letter-spacing: 2px;
}

/* OVERLAY */
.overlay {
  display: flex;
  justify-content: center;
  gap: 20px;

  padding-top: 6px;
  opacity: 0.8;
}

.hud {
  display: flex;
  gap: 12px;
  font-size: 14px;
  opacity: 0.75;
}
</style>
