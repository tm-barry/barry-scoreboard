<template>
  <div
    v-if="bracket"
    class="viewport"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @wheel="onWheel"
  >
    <div v-if="bracket" class="bracket-canvas" :style="canvasTransform">
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

      <div
        v-for="match in matches"
        :key="match.id"
        class="match"
        :style="getMatchStyle(match.id)"
      >
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
  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, ref, type StyleValue } from 'vue';
import { useBracketStore } from '../../stores/bracket';
import type { Match, Slot } from '../../interfaces/bracket';
import {
  computeBracketLayout,
  computeEdges,
  MATCH_WIDTH,
  TEAM_GAP,
  TEAM_HEIGHT,
} from '../../engines/bracketLayout';
import { storeToRefs } from 'pinia';

const bracketStore = useBracketStore();
const { currentBracket: bracket } = storeToRefs(bracketStore);

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const PAN_PADDING = 200;
const scale = ref(1);
const offsetX = ref(0);
const offsetY = ref(0);
const pointers = new Map<number, PointerEvent>();
let lastPinchDistance = 0;
let isPanning = false;
let hasDragged = false;
let lastPan = { x: 0, y: 0 };

const matches = computed(() => bracket.value?.matches ?? []);

const canvasTransform = computed(() => ({
  transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})`,
  transformOrigin: '0 0',
}));

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
  switch (slot.type) {
    case 'team': {
      const team = bracket.value?.teams.find((t) => t.id === slot.id);
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

function isWinner(match: Match, slot: Slot): boolean {
  return !!match.winner && slot.type === 'team' && slot.id === match.winner.id;
}

function getTeamStyle(): StyleValue {
  return {
    height: `${TEAM_HEIGHT}px`,
  };
}

function selectWinner(match: Match, slot: Slot) {
  if (hasDragged) return;
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

function onPointerDown(e: PointerEvent) {
  pointers.set(e.pointerId, e);

  (e.target as HTMLElement).setPointerCapture(e.pointerId);

  hasDragged = false;

  if (pointers.size === 1) {
    isPanning = true;
    lastPan = { x: e.clientX, y: e.clientY };
  }

  if (pointers.size === 2) {
    isPanning = false;
    lastPinchDistance = getPointerDistance();
  }
}

function getPointerList() {
  return Array.from(pointers.values());
}

function getPointerDistance() {
  const [a, b] = getPointerList();
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getPointerMidpoint() {
  const [a, b] = getPointerList();
  return {
    x: (a.clientX + b.clientX) / 2,
    y: (a.clientY + b.clientY) / 2,
  };
}

function onPointerMove(e: PointerEvent) {
  if (!pointers.has(e.pointerId)) return;

  pointers.set(e.pointerId, e);

  // Pinch Zoom (2 pointers)
  if (pointers.size === 2) {
    const distance = getPointerDistance();
    const midpoint = getPointerMidpoint();

    if (lastPinchDistance) {
      const delta = distance / lastPinchDistance;

      applyZoom(scale.value * delta, midpoint.x, midpoint.y);
    }

    lastPinchDistance = distance;
    return;
  }

  // Pan (1 pointer)
  if (pointers.size === 1 && isPanning) {
    const dx = e.clientX - lastPan.x;
    const dy = e.clientY - lastPan.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasDragged = true;
    }

    offsetX.value += dx;
    offsetY.value += dy;

    lastPan = { x: e.clientX, y: e.clientY };
    clampPan();
  }
}

function onPointerUp(e: PointerEvent) {
  pointers.delete(e.pointerId);

  if (pointers.size < 2) {
    lastPinchDistance = 0;
  }

  if (pointers.size === 0) {
    isPanning = false;
  }

  (e.target as HTMLElement).releasePointerCapture(e.pointerId);
}

function onWheel(e: WheelEvent) {
  e.preventDefault();

  const zoomIntensity = 0.002;
  const delta = -e.deltaY * zoomIntensity;

  const newScale = scale.value * (1 + delta);

  applyZoom(newScale, e.clientX, e.clientY);
}

function applyZoom(newScale: number, cx: number, cy: number) {
  const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newScale));

  const factor = clamped / scale.value;

  offsetX.value = cx - (cx - offsetX.value) * factor;
  offsetY.value = cy - (cy - offsetY.value) * factor;

  scale.value = clamped;
  clampPan();
}

function clampPan() {
  const maxX = PAN_PADDING;
  const maxY = PAN_PADDING;
  const minX = -layout.value.width * scale.value + PAN_PADDING;
  const minY = -layout.value.height * scale.value + PAN_PADDING;

  offsetX.value = Math.min(maxX, Math.max(minX, offsetX.value));
  offsetY.value = Math.min(maxY, Math.max(minY, offsetY.value));
}

function resetView() {
  scale.value = 1;
  offsetX.value = 0;
  offsetY.value = 0;
}

onActivated(() => {
  resetView();
});
</script>

<style scoped>
.viewport {
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: none;
}

.bracket-canvas {
  position: relative;
  transform-origin: 0 0;
  overflow: visible;
  margin: 16px;
}

.bracket-canvas.interacting button {
  pointer-events: none;
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
