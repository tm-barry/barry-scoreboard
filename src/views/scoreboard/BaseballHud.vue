<template>
  <div class="hud baseball">
    <!-- LEFT: B / S / O count -->
    <div class="counts">
      <div v-for="c in counts" :key="c.key" class="count-row">
        <div class="count-label">{{ c.label }}</div>
        <div class="dots" @click="c.add()">
          <span
            v-for="n in c.max"
            :key="n"
            class="dot"
            :class="[c.key, { on: n <= c.value }]"
          />
        </div>
        <div class="count-controls">
          <IconButton name="minus" :icon-size="28" @click.stop="c.sub()" />
          <IconButton name="plus" :icon-size="28" @click.stop="c.add()" />
        </div>
      </div>
    </div>

    <!-- CENTER: diamond -->
    <svg class="diamond" viewBox="-6 -6 132 112" aria-label="Bases">
      <!-- infield outline -->
      <polygon points="60,88 108,50 60,12 12,50" class="infield" />
      <!-- bases: second (top), third (left), first (right) -->
      <rect
        v-for="b in bases"
        :key="b.key"
        :x="b.x - 11"
        :y="b.y - 11"
        width="22"
        height="22"
        :transform="`rotate(45 ${b.x} ${b.y})`"
        class="base"
        :class="{ on: scoreboard.bases[b.key] }"
        @click="store.toggleBase(b.key)"
      />
      <!-- home plate (not interactive) -->
      <polygon points="60,80 68,86 64,94 56,94 52,86" class="home" />
    </svg>

    <!-- RIGHT: inning half -->
    <div class="half">
      <button
        type="button"
        class="half-btn"
        :class="{ on: scoreboard.halfInning === 'top' }"
        @click="store.setInningHalf('top')"
      >
        ▲ Top
      </button>
      <button
        type="button"
        class="half-btn"
        :class="{ on: scoreboard.halfInning === 'bottom' }"
        @click="store.setInningHalf('bottom')"
      >
        ▼ Bot
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useScoreboardStore } from '../../stores/scoreboard';
import type { BaseballScoreboard } from '../../interfaces/scoreboard';

const props = defineProps<{ scoreboard: BaseballScoreboard }>();
const store = useScoreboardStore();

const counts = computed(() => [
  {
    key: 'ball',
    label: 'B',
    max: 3,
    value: props.scoreboard.balls,
    add: () => store.adjustBalls(1),
    sub: () => store.adjustBalls(-1),
  },
  {
    key: 'strike',
    label: 'S',
    max: 2,
    value: props.scoreboard.strikes,
    add: () => store.adjustStrikes(1),
    sub: () => store.adjustStrikes(-1),
  },
  {
    key: 'out',
    label: 'O',
    max: 2,
    value: props.scoreboard.outs,
    add: () => store.adjustOuts(1),
    sub: () => store.adjustOuts(-1),
  },
]);

const bases = [
  { key: 'second', x: 60, y: 14 },
  { key: 'third', x: 14, y: 50 },
  { key: 'first', x: 106, y: 50 },
] as const;
</script>

<style scoped>
.hud {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  opacity: 0.85;
  pointer-events: auto;
}

.counts {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-self: end;
}

.count-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.count-label {
  font-size: 40px;
  font-weight: 700;
  width: 36px;
}

.dots {
  display: flex;
  gap: 10px;
  width: 110px; /* fits 3 dots so rows line up */
  cursor: pointer;
}

.dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid currentColor;
  opacity: 0.3;
}

.dot.on {
  opacity: 1;
}
.dot.ball.on {
  background: var(--color-success, #3fb950);
  border-color: var(--color-success, #3fb950);
}
.dot.strike.on {
  background: var(--color-warning, #f0b400);
  border-color: var(--color-warning, #f0b400);
}
.dot.out.on {
  background: var(--color-danger, #f85149);
  border-color: var(--color-danger, #f85149);
}

.count-controls {
  display: flex;
  gap: 8px;
  opacity: 0.4;
}

.diamond {
  width: 230px;
  height: auto;
  overflow: visible;
}

.infield {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  opacity: 0.25;
}

.base {
  fill: transparent;
  stroke: currentColor;
  stroke-width: 2;
  opacity: 0.4;
  cursor: pointer;
}

.base.on {
  fill: var(--color-warning, #f0b400);
  stroke: var(--color-warning, #f0b400);
  opacity: 1;
}

.home {
  fill: currentColor;
  opacity: 0.3;
}

.half {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-self: start;
}

.half-btn {
  font-size: 32px;
  padding: 6px 20px;
  background: transparent;
  color: inherit;
  border: 2px solid currentColor;
  border-radius: 8px;
  opacity: 0.3;
  cursor: pointer;
}

.half-btn.on {
  opacity: 1;
}
</style>
