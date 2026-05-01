<template>
  <InteractiveViewport
    v-if="bracket"
    :width="layout.width"
    :height="layout.height"
    @drag-start="isDragging = true"
    @drag-end="isDragging = false"
  >
    <template #default>
      <!-- Bracket canvas -->
      <div class="bracket-canvas">
        <!-- Connections -->
        <svg
          class="connections"
          :viewBox="`0 0 ${layout.width} ${layout.height}`"
          :width="layout.width"
          :height="layout.height"
        >
          <path
            v-for="(e, i) in edges"
            :key="i"
            :d="e.d"
            fill="none"
            stroke="#666"
            stroke-width="2"
          />
        </svg>

        <!-- Matches -->
        <div
          v-for="match in matches"
          :key="match.id"
          class="match"
          :style="getMatchStyle(match.id)"
        >
          <!-- Team A -->
          <button
            class="team"
            :class="
              isWinner(match, match.teamA) ? 'primary-btn' : 'secondary-btn'
            "
            :style="getTeamStyle()"
            :disabled="teamButtonDisabled(match.teamA)"
            @click="selectWinner(match, match.teamA)"
          >
            <sup v-if="getTeamSeed(match.teamA)">
              {{ getTeamSeed(match.teamA) }}
            </sup>
            {{ getTeamName(match.teamA) }}
          </button>

          <!-- Team B -->
          <button
            class="team"
            :class="
              isWinner(match, match.teamB) ? 'primary-btn' : 'secondary-btn'
            "
            :style="getTeamStyle()"
            :disabled="teamButtonDisabled(match.teamB)"
            @click="selectWinner(match, match.teamB)"
          >
            <sup v-if="getTeamSeed(match.teamB)">
              {{ getTeamSeed(match.teamB) }}
            </sup>
            {{ getTeamName(match.teamB) }}
          </button>
        </div>
      </div>
    </template>

    <!-- Overlay controls -->
    <template #overlay="{ reset, fit }">
      <div class="viewport-controls">
        <IconButton name="rotateCcw" @click="reset" />
        <IconButton name="frame" @click="fit" />
      </div>
    </template>
  </InteractiveViewport>
</template>

<script setup lang="ts">
import { computed, ref, type StyleValue } from 'vue';
import { useBracketStore } from '../../stores/bracket';
import InteractiveViewport from '../../components/ui/InteractiveViewport.vue';
import type { Match, Slot } from '../../interfaces/bracket';
import {
  computeBracketLayout,
  computeEdges,
  MATCH_WIDTH,
  TEAM_GAP,
  TEAM_HEIGHT,
} from '../../engines/bracketLayout';

const bracketStore = useBracketStore();

const isDragging = ref(false);

const bracket = computed(() => bracketStore.currentBracket);
const matches = computed(() => bracket.value?.matches ?? []);
const layout = computed(() => computeBracketLayout(matches.value));
const edges = computed(() =>
  computeEdges(matches.value, layout.value.matchLayouts),
);

function teamButtonDisabled(slot: Slot): boolean {
  return slot.type !== 'team';
}

function getTeamName(slot: Slot): string {
  switch (slot.type) {
    case 'team': {
      const team = bracket.value?.teams.find((t) => t.id === slot.id);
      return team ? team.name : 'Unknown Team';
    }
    case 'pending':
      return 'Pending';
    case 'bye':
      return 'Bye';
  }
}

function getTeamSeed(slot: Slot): number | undefined {
  if (slot.type !== 'team') return undefined;

  return bracket.value?.teams.find((t) => t.id === slot.id)?.seed;
}

function getMatchStyle(matchId: string): StyleValue {
  const l = layout.value.matchLayouts.get(matchId);
  if (!l) return {};

  return {
    position: 'absolute',
    transform: `translate(${l.x}px, ${l.y}px)`,
    width: `${MATCH_WIDTH}px`,
    gap: `${TEAM_GAP}px`,
  };
}

function getTeamStyle(): StyleValue {
  return {
    height: `${TEAM_HEIGHT}px`,
  };
}

function isWinner(match: Match, slot: Slot): boolean {
  return !!match.winner && slot.type === 'team' && slot.id === match.winner.id;
}

function selectWinner(match: Match, slot: Slot) {
  if (isDragging.value) return;
  if (!bracket.value) return;
  if (slot.type !== 'team') return;

  const isSameWinner =
    match.winner?.type === 'team' && match.winner.id === slot.id;

  if (isSameWinner) {
    bracketStore.unsetMatchWinner(match.id);
    return;
  }

  bracketStore.setMatchWinner(match.id, slot.id);
}
</script>

<style scoped>
.bracket-canvas {
  position: relative;
  overflow: visible;
}

.match {
  position: absolute;
  display: flex;
  flex-direction: column;
  z-index: 2;
}

.connections {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
}

.team {
  font-size: 0.8rem;
  overflow: hidden;
}

.primary-btn {
  font-weight: 600;
}

.viewport-controls {
  position: absolute;
  top: 12px;
  right: 12px;

  display: flex;
  gap: 16px;

  z-index: 1000;
}
</style>
