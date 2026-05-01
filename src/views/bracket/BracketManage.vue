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
          <div class="match-teams" :style="getMatchTeamsStyle()">
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
              <span class="team-name">
                <sup v-if="getTeamSeed(match.teamA)">
                  {{ getTeamSeed(match.teamA) }}
                </sup>
                {{ getTeamName(match.teamA) }}
              </span>
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

          <!-- Team B -->
          <div class="match-actions">
            <IconButton
              name="monitor"
              :icon-size="20"
              class="scoreboard-btn"
              @click.stop="openScoreboard(bracket, match)"
            />
          </div>
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
import { useRouter } from 'vue-router';
import { useBracketStore } from '../../stores/bracket';
import { useScoreboardStore } from '../../stores/scoreboard';
import InteractiveViewport from '../../components/ui/InteractiveViewport.vue';
import type { Bracket, Match, Slot } from '../../interfaces/bracket';
import {
  computeBracketLayout,
  computeEdges,
  MATCH_WIDTH,
  TEAM_GAP,
  TEAM_HEIGHT,
} from '../../engines/bracketLayout';

const router = useRouter();
const bracketStore = useBracketStore();
const scoreboardStore = useScoreboardStore();

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
  };
}

function getMatchTeamsStyle(): StyleValue {
  return {
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

async function openScoreboard(bracket: Bracket, match: Match) {
  if (isDragging.value) return;

  const success = await scoreboardStore.setBracketMatchScoreboard(
    bracket.id,
    match.id,
  );

  if (success) router.push({ name: 'scoreboard-play' });
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
  flex-direction: row;
  align-items: center;
  gap: 10px;
  z-index: 2;
}

.match-teams {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.match-actions {
  display: flex;
  align-items: center;
  justify-content: center;
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

.team-name {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  line-height: 1.2;
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
