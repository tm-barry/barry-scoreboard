<template>
  <ViewportScaler class="no-select">
    <div
      class="canvas"
      :class="{ editing: isEditing, compact: !!footballScoreboard }"
    >
      <!-- Edit -->
      <div class="edit-button">
        <IconButton
          :name="isEditing ? 'check' : 'pencil'"
          :icon-size="36"
          @click="toggleEdit()"
        />
      </div>

      <!-- Bracket Match Button -->
      <div v-if="hasBracketMatch" class="bracket-button">
        <IconButton
          name="network"
          :icon-size="36"
          :icon-class="'rotate-90'"
          :disabled="!canSaveBracketMatch"
          @click="saveBracketMatch()"
        />
      </div>

      <!-- Timer -->
      <div class="top-bar" :class="{ compact: footballScoreboard }">
        <div v-if="!baseballScoreboard" class="timer" @click="onTimerClicked">
          <TimeInput
            v-if="isEditing"
            v-model="timerInput"
            class="timer-input"
          />
          <span v-else :style="timerStyle">
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
                <input
                  v-if="isEditing"
                  v-model="editTeamAName"
                  placeholder="Enter team A name..."
                  class="name-input"
                />
                <span v-else class="name-text">
                  {{ teamAName }}
                </span>
              </div>
              <div class="score" @click="adjustTeamScore('A')">
                {{ scoreboard?.scoreA ?? 0 }}
              </div>
            </div>
            <div
              class="score-controls"
              :class="{ football: footballScoreboard }"
            >
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
              <template v-if="footballScoreboard">
                <button
                  v-for="pts in footballQuickScores"
                  :key="pts"
                  type="button"
                  class="score-chip"
                  @click.stop="adjustTeamScore('A', pts)"
                >
                  +{{ pts }}
                </button>
              </template>
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
                <input
                  v-if="isEditing"
                  v-model="editTeamBName"
                  placeholder="Enter team B name..."
                  class="name-input"
                />
                <span v-else class="name-text">
                  {{ teamBName }}
                </span>
              </div>
              <div class="score" @click="adjustTeamScore('B')">
                {{ scoreboard?.scoreB ?? 0 }}
              </div>
            </div>
            <div
              class="score-controls"
              :class="{ football: footballScoreboard }"
            >
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
              <template v-if="footballScoreboard">
                <button
                  v-for="pts in footballQuickScores"
                  :key="pts"
                  type="button"
                  class="score-chip"
                  @click.stop="adjustTeamScore('B', pts)"
                >
                  +{{ pts }}
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Sports Overlay (generic has no HUD) -->
      <div
        class="overlay"
        :class="{ flow: baseballScoreboard || footballScoreboard }"
      >
        <BaseballHud
          v-if="baseballScoreboard"
          :scoreboard="baseballScoreboard"
        />
        <BasketballHud
          v-if="basketballScoreboard"
          :scoreboard="basketballScoreboard"
        />
        <FootballHud
          v-if="footballScoreboard"
          :scoreboard="footballScoreboard"
        />
      </div>
    </div>
  </ViewportScaler>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBracketStore } from '../../stores/bracket';
import { useScoreboardStore } from '../../stores/scoreboard';
import { useConfirm } from '../../composables/useConfirm';
import { storeToRefs } from 'pinia';
import type {
  BaseballScoreboard,
  BasketballScoreboard,
  FootballScoreboard,
} from '../../interfaces/scoreboard';
import TimeInput from '../../components/ui/TimeInput.vue';
import ViewportScaler from '../../components/ui/ViewportScaler.vue';
import BaseballHud from './BaseballHud.vue';
import BasketballHud from './BasketballHud.vue';
import FootballHud from './FootballHud.vue';
import { CountdownTimer } from '../../utils/timer';
import { initAudio, playBuzzer, stopAllAudio } from '../../engines/audioEngine';

type EditMode = 'none' | 'segmentDuration' | 'timeRemaining';

const router = useRouter();
const { confirm } = useConfirm();

let timer: CountdownTimer;
const bracketStore = useBracketStore();
const scoreboardStore = useScoreboardStore();
const { scoreboard, hasBracketMatch } = storeToRefs(scoreboardStore);
const editMode = ref<EditMode>('none');
const timerRunning = ref(false);

const footballQuickScores = [2, 3, 6];

const editingSegmentDuration = computed(
  () => editMode.value === 'segmentDuration',
);

const isSegmentDurationSet = computed(
  () => !!scoreboard.value?.timer?.segmentDuration,
);

const timerStyle = computed(() => {
  if (!isSegmentDurationSet.value) {
    return { opacity: 0.3 };
  } else if (!timerRunning.value) {
    return {
      color: 'var(--color-warning)',
      transform: 'scale(0.98)',
    };
  }
  return undefined;
});

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

const canSaveBracketMatch = computed(() => {
  return (
    scoreboard.value &&
    hasBracketMatch.value &&
    (scoreboard.value.scoreA || 0) != (scoreboard.value.scoreB || 0)
  );
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

const footballScoreboard = computed(() =>
  scoreboard.value?.type === 'football'
    ? (scoreboard.value as FootballScoreboard)
    : null,
);

const segmentName = computed(() => {
  switch (scoreboard.value?.type) {
    case 'baseball':
      return 'Inning';
    case 'football':
      return 'Quarter';
    default:
      return 'Period';
  }
});

const editTeamAName = computed({
  get: () => scoreboard.value?.teamA,
  set: (val: string) => {
    if (scoreboard.value) scoreboard.value.teamA = val;
  },
});

const teamAName = computed(() => scoreboard.value?.teamA || 'Team A');

const editTeamBName = computed({
  get: () => scoreboard.value?.teamB,
  set: (val: string) => {
    if (scoreboard.value) scoreboard.value.teamB = val;
  },
});

const teamBName = computed(() => scoreboard.value?.teamB || 'Team B');

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
    scoreboardStore.queueSave();
  } else {
    timer.pause();
  }
  timerRunning.value = false;
  isEditing.value = !isEditing.value;
}

async function saveBracketMatch() {
  if (!scoreboard.value?.bracketId || !scoreboard.value?.matchId) return;

  const winner =
    (scoreboard.value.scoreA || 0) > (scoreboard.value.scoreB || 0)
      ? scoreboard.value.teamA || 'Team A'
      : scoreboard.value.teamB || 'Team B';

  const ok = await confirm({
    title: 'Confirm Winner',
    message: `Do you want to set ${winner} as the winner of the match?`,
    confirmText: 'Yes',
    cancelText: 'No',
  });

  if (!ok) return;

  await bracketStore.setBracketMatchWinnerByScore(
    scoreboard.value.bracketId,
    scoreboard.value.matchId,
    scoreboard.value.scoreA || 0,
    scoreboard.value.scoreB || 0,
  );
  router.push({ name: 'bracket-manage' });
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
    timerRunning.value = false;
    scoreboardStore.queueSave();
    return;
  }

  const timeRemaining = timer.getRemaining();
  if (timeRemaining) {
    timer.start(timeRemaining);
    timerRunning.value = true;
  }
}

function adjustSegment(delta: number = 1) {
  const timerData = scoreboard.value?.timer;

  if (timerData && timerData.timeRemaining === 0) {
    timerData.timeRemaining = timerData.segmentDuration;
    timer.reset(timerData.segmentDuration);
    timerRunning.value = false;
  }

  scoreboardStore.adjustSegment(delta);
}

function adjustTeamScore(team: 'A' | 'B', delta: number = 1) {
  scoreboardStore.adjustTeamScore(team, delta);
}

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
        scoreboardStore.queueSave();
      }
    },
  });

  if (scoreboard.value?.timer?.timeRemaining)
    timer.reset(scoreboard.value.timer.timeRemaining);
});

onUnmounted(() => {
  editMode.value = 'none';
  timer.stop();
  stopAllAudio();
  scoreboardStore.queueSave();
});
</script>

<style scoped>
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

.bracket-button {
  position: absolute;
  top: 16px;
  left: 16px;
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

/* Football: tighter layout so the in-flow HUD fits */
.canvas.compact .top-bar {
  flex-direction: row;
  gap: 120px;
  padding-top: 8px;
}

.canvas.compact .timer {
  width: 440px;
  text-align: center;
}

.canvas.compact .segment-name {
  font-size: 28px;
}

.canvas.compact .segment-value {
  font-size: 56px;
}

.canvas.compact .segment-controls {
  padding-top: 6px;
}

.canvas.compact .name {
  min-height: 56px;
}

.canvas.compact .score {
  font-size: 130px;
  min-height: 110px;
}

.canvas.compact .score-controls {
  padding-top: 12px;
}

.canvas.compact .overlay.flow {
  padding: 4px 0 12px;
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

.name-input {
  width: 400px;
  text-align: center;
  font-size: 32px;
  line-height: 1.3;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-h);
}

.name-input:focus {
  border: none;
  outline: none;
  box-shadow: none;
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

/* tighter spacing to fit the +2/+3/+6 chips */
.score-controls.football {
  gap: 14px;
}

.score-chip {
  font-size: 28px;
  padding: 4px 14px;
  background: transparent;
  color: inherit;
  border: 2px solid currentColor;
  border-radius: 8px;
  cursor: pointer;
}

/* VS stays centered */
.vs {
  font-size: 36px;
  font-weight: 600;
  opacity: 0.35;
  letter-spacing: 2px;
}

/* OVERLAY – each HUD component owns its own styles and re-enables pointer events */
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

/* In-flow HUD: takes the grid's 3rd row instead of floating over the scores */
.overlay.flow {
  position: static;
  padding: 8px 0 16px;
}
</style>
