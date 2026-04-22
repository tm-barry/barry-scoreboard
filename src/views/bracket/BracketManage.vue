<template>
  <div class="bracket-canvas" :style="canvasStyle">
    <svg
      class="connections"
      :viewBox="`0 0 ${layout.width} ${layout.height}`"
      preserveAspectRatio="none"
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

    <div
      v-for="match in bracket.matches"
      :key="match.id"
      class="match"
      :style="getMatchStyle(match.id)"
    >
      <button
        class="secondary-btn team"
        :style="getTeamStyle()"
        :disabled="teamButtonDisabled(match.teamA)"
      >
        <sup v-if="getTeamSeed(match.teamA)">
          {{ getTeamSeed(match.teamA) }}
        </sup>
        {{ getTeamName(match.teamA) }}
      </button>

      <button
        class="secondary-btn team"
        :style="getTeamStyle()"
        :disabled="teamButtonDisabled(match.teamB)"
      >
        <sup v-if="getTeamSeed(match.teamB)">
          {{ getTeamSeed(match.teamB) }}
        </sup>
        {{ getTeamName(match.teamB) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type StyleValue, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useBracketStore } from '../../stores/bracket';
import type { Slot } from '../../interfaces/bracket';
import {
  computeBracketLayout,
  computeEdges,
  MATCH_WIDTH,
  TEAM_GAP,
  TEAM_HEIGHT,
} from '../../engines/bracketLayout';
import { storeToRefs } from 'pinia';

const router = useRouter();
const bracketStore = useBracketStore();
const { currentBracket } = storeToRefs(bracketStore);

const bracket = computed(() => currentBracket.value!);

const canvasStyle = computed(() => ({
  width: `${layout.value.width}px`,
  height: `${layout.value.height}px`,
}));

const layout = computed(() => computeBracketLayout(bracket.value.matches));

const edges = computed(() =>
  computeEdges(bracket.value.matches, layout.value.matchLayouts),
);

function teamButtonDisabled(team: Slot): boolean {
  return team.type !== 'team';
}

function getTeamName(slot: Slot): string {
  switch (slot.type) {
    case 'team': {
      const team = bracket.value.teams.find((t) => t.id === slot.id);
      return team ? team.name : 'Unknown Team';
    }
    case 'pending':
      return 'Pending';
    case 'bye':
      return 'Bye';
  }
}

function getTeamSeed(slot: Slot): number | undefined {
  switch (slot.type) {
    case 'team': {
      const team = bracket.value.teams.find((t) => t.id === slot.id);
      return team?.seed;
    }
    default:
      return undefined;
  }
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

watchEffect(() => {
  if (!currentBracket.value) {
    router.replace({ name: 'bracket' });
  }
});
</script>

<style scoped>
.bracket-canvas {
  position: relative;
  overflow: visible;
  margin-bottom: 16px;
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
}

.team {
  font-size: 0.8rem;
  overflow: hidden;
}
</style>
