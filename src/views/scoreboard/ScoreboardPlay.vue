<template>
  <div ref="viewportRef" class="viewport no-select">
    <div ref="scaleWrapper" class="scale-wrapper">
      <div class="canvas" :class="{ editing: isEditing }">
        <!-- Edit -->
        <div class="edit-button">
          <IconButton
            :name="isEditing ? 'check' : 'pencil'"
            :icon-size="36"
            @click="toggleEdit()"
          />
        </div>

        <!-- Timer -->
        <div class="top-bar">
          <div v-if="!baseballScoreboard" class="timer" @click="onTimerClicked">
            <TimeInput
              v-if="isEditing"
              v-model="timerInput"
              class="timer-input"
            />
            <span v-else :style="{ opacity: isSegmentDurationSet ? 1 : 0.3 }">
              {{ formattedTime }}
            </span>
          </div>

          <!-- Segment moved BELOW timer -->
          <div class="segment">
            <div class="segment-name">{{ segmentName }}</div>
            <div class="segment-value" @click="adjustSegment()">
              {{ scoreboard?.segment ?? 0 }}
            </div>
            <div class="segment-controls">
              <IconButton
                name="minus"
                :icon-size="36"
                @click.stop="adjustSegment(-1)"
              />
              <IconButton
                name="plus"
                :icon-size="36"
                @click.stop="adjustSegment()"
              />
            </div>
          </div>
        </div>

        <!-- Main Score -->
        <div class="main">
          <!-- LEFT HALF -->
          <div class="side left">
            <div>
              <div class="team">
                <div class="name">
                  <span class="name-text">{{ teamAName }}</span>
                </div>
                <div class="score" @click="adjustTeamScore('A')">
                  {{ scoreboard?.scoreA ?? 0 }}
                </div>
              </div>
              <div class="score-controls">
                <IconButton
                  name="minus"
                  :icon-size="36"
                  @click.stop="adjustTeamScore('A', -1)"
                />
                <IconButton
                  name="plus"
                  :icon-size="36"
                  @click.stop="adjustTeamScore('A')"
                />
              </div>
            </div>
          </div>

          <!-- CENTER -->
          <div class="vs">VS</div>

          <!-- RIGHT HALF -->
          <div class="side right">
            <div>
              <div class="team">
                <div class="name">
                  <span class="name-text">{{ teamBName }}</span>
                </div>
                <div class="score" @click="adjustTeamScore('B')">
                  {{ scoreboard?.scoreB ?? 0 }}
                </div>
              </div>
              <div class="score-controls">
                <IconButton
                  name="minus"
                  :icon-size="36"
                  @click.stop="adjustTeamScore('B', -1)"
                />
                <IconButton
                  name="plus"
                  :icon-size="36"
                  @click.stop="adjustTeamScore('B')"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Sports Overlay -->
        <div class="overlay">
          <!-- TODO - Finish Baseball Overlay -->
          <div v-if="baseballScoreboard" class="hud baseball">
            <div>B: {{ baseballScoreboard.balls }}</div>
            <div>S: {{ baseballScoreboard.strikes }}</div>
            <div>O: {{ baseballScoreboard.outs }}</div>
          </div>

          <div v-if="basketballScoreboard" class="hud basketball">
            <!-- LEFT (Team A) -->
            <div class="hud-side left">
              <div class="foul-block">
                <div class="label">Fouls</div>
                <div class="value" @click="adjustTeamFouls('A')">
                  {{ basketballScoreboard.foulsA }}
                </div>

                <div class="foul-controls">
                  <IconButton
                    name="minus"
                    :icon-size="36"
                    @click.stop="adjustTeamFouls('A', -1)"
                  />
                  <IconButton
                    name="plus"
                    :icon-size="36"
                    @click.stop="adjustTeamFouls('A')"
                  />
                </div>
              </div>
            </div>

            <!-- CENTER (Possession) -->
            <div class="hud-center">
              <Icon
                name="arrowBigLeft"
                class="arrow"
                :class="{ active: basketballScoreboard.possession === 'A' }"
                :size="64"
                @click="setPossession('A')"
              />
              <Icon
                name="arrowBigRight"
                class="arrow"
                :class="{ active: basketballScoreboard.possession === 'B' }"
                :size="64"
                @click="setPossession('B')"
              />
            </div>

            <!-- RIGHT (Team B) -->
            <div class="hud-side right">
              <div class="foul-block">
                <div class="label">Fouls</div>
                <div class="value" @click="adjustTeamFouls('B')">
                  {{ basketballScoreboard.foulsB }}
                </div>

                <div class="foul-controls">
                  <IconButton
                    name="minus"
                    :icon-size="36"
                    @click.stop="adjustTeamFouls('B', -1)"
                  />
                  <IconButton
                    name="plus"
                    :icon-size="36"
                    @click.stop="adjustTeamFouls('B')"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onActivated, onDeactivated, onMounted } from 'vue';
import { useScoreboardStore } from '../../stores/scoreboard';
import { storeToRefs } from 'pinia';
import type {
  BaseballScoreboard,
  BasketballScoreboard,
} from '../../interfaces/scoreboard';
import Icon from '../../components/icons/Icon.vue';
import TimeInput from '../../components/ui/TimeInput.vue';
import { CountdownTimer } from '../../utils/timer';
import { initAudio, playBuzzer } from '../../engines/audioEngine';

type EditMode = 'none' | 'segmentDuration' | 'timeRemaining';

const BASE_W = 1280;
const BASE_H = 720;

let timer: CountdownTimer;

const viewportRef = ref<HTMLElement | null>(null);
const scaleWrapper = ref<HTMLElement | null>(null);
const scoreboardStore = useScoreboardStore();
const { scoreboard } = storeToRefs(scoreboardStore);

const editMode = ref<EditMode>('none');

const editingSegmentDuration = computed(
  () => editMode.value === 'segmentDuration',
);

const isSegmentDurationSet = computed(
  () => !!scoreboard.value?.timer?.segmentDuration,
);

const timerInput = computed({
  get() {
    return (
      (editingSegmentDuration.value
        ? scoreboard.value?.timer?.segmentDuration
        : scoreboard.value?.timer?.timeRemaining) ?? 0
    );
  },
  set(value) {
    if (scoreboard.value?.timer) {
      if (editingSegmentDuration.value) {
        scoreboard.value.timer.segmentDuration = value ?? 0;
      }
      scoreboard.value.timer.timeRemaining = value ?? 0;
    }
  },
});

const isEditing = computed({
  get: () => editMode.value !== 'none',
  set: (value) => {
    if (value) {
      editMode.value = !scoreboard.value?.timer
        ? 'segmentDuration'
        : 'timeRemaining';

      if (scoreboard.value && editingSegmentDuration.value) {
        scoreboard.value.timer = {
          segmentDuration: 600000,
          timeRemaining: 600000,
        };
      }
    } else {
      editMode.value = 'none';
    }
  },
});

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
  const t = scoreboard.value?.timer?.timeRemaining ?? 0; // ms

  const totalSeconds = Math.floor(t / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const milliseconds = t % 1000;
  const hundredths = Math.floor(milliseconds / 10);

  const base = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // show hundredths only under 10 seconds remaining
  if (t > 0 && totalSeconds < 10) {
    return `${base}.${hundredths.toString().padStart(2, '0')}`;
  }

  return base;
});

function toggleEdit() {
  if (isEditing.value) {
    timer.reset(timerInput.value);
  } else {
    timer.pause();
  }
  isEditing.value = !isEditing.value;
}

function onTimerClicked() {
  initAudio();
  if (isEditing.value) return;

  if (!isSegmentDurationSet.value) {
    isEditing.value = true;
    return;
  }

  if (timer.isRunning()) {
    timer.pause();
    return;
  }

  const timeRemaining = timer.getRemaining();
  if (timeRemaining) timer.start(timeRemaining);
}

async function adjustSegment(delta: number = 1) {
  scoreboardStore.adjustSegment(delta);
  // TODO - save
}

async function adjustTeamScore(team: 'A' | 'B', delta: number = 1) {
  scoreboardStore.adjustTeamScore(team, delta);
  // TODO - save
}

/* ---------- Basketball Methods ---------- */
async function setPossession(team: 'A' | 'B') {
  scoreboardStore.setPossession(team);
  // TODO - save
}

async function adjustTeamFouls(team: 'A' | 'B', delta: number = 1) {
  scoreboardStore.adjustTeamFouls(team, delta);
  // TODO - save
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

  editMode.value = 'none';
  timer.stop();
});

onMounted(() => {
  timer = new CountdownTimer({
    durationMs: 600000,
    useHighResolutionTime: true,

    onTick: (ms) => {
      if (scoreboard.value?.timer) {
        scoreboard.value.timer.timeRemaining = ms;
      }
    },

    onComplete: () => {
      if (scoreboard.value?.timer) {
        scoreboard.value.timer.timeRemaining = 0;
        playBuzzer();
      }
    },
  });
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
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr auto;
  box-sizing: border-box;
  color: var(--scoreboard-text);
}

.canvas.editing {
  outline: 2px dashed var(--color-primary);
  outline-offset: -2px;
}

.edit-button {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  opacity: 0.8;
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
  cursor: pointer;
}

.timer,
.timer-input {
  font-size: 128px;
  font-weight: 600;
  letter-spacing: -0.5px;
  line-height: 1;
  height: 125px;
  font-variant-numeric: tabular-nums;
}

.timer-input {
  text-align: center;
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-h);
  padding: 0;
  margin: 0;
}

.timer-input:focus {
  border: none;
  outline: none;
  box-shadow: none;
}

.segment {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 8px;
}

.segment-name {
  font-size: 36px;
  opacity: 0.65;
}

.segment-value {
  font-size: 72px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
}

.segment-controls {
  padding-top: 15px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 30px;
  opacity: 0.35;
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
  width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
}

.name {
  width: 400px;
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
  font-size: 32px;
  line-height: 1.3;
}

.score {
  font-size: 160px;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  font-variant-numeric: tabular-nums;
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.score-controls {
  padding-top: 30px;
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
  opacity: 0.35;
  letter-spacing: 2px;
}

/* OVERLAY */
.overlay {
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;

  display: flex;
  justify-content: center;
  gap: 20px;

  pointer-events: none;
}

.hud {
  display: flex;
  gap: 12px;
  font-size: 14px;
  opacity: 0.75;
}

/* Basketball */
.hud.basketball {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 600px;
}

/* =========================
   FOUL BLOCK (LEFT / RIGHT)
========================= */
.hud.basketball .foul-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: auto;
}

.hud.basketball .foul-block .label {
  font-size: 24px;
}

.hud.basketball .foul-block .value {
  font-size: 64px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}

/* foul +/- buttons */
.hud.basketball .foul-controls {
  display: flex;
  gap: 10px;
  opacity: 0.4;
}

/* =========================
   CENTER (POSSESSION)
========================= */
.hud.basketball .hud-center {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  pointer-events: auto;
}

/* arrows */
.hud.basketball .arrow {
  opacity: 0.2;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.hud.basketball .arrow.active {
  opacity: 1;
}

/* optional subtle emphasis */
.hud.basketball .arrow:hover {
  transform: scale(1.05);
}

/* =========================
   SAFETY: SIDE CONTAINERS
========================= */
.hud.basketball .hud-side {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
</style>
