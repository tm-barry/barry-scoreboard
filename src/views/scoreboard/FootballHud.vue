<template>
  <div class="hud football">
    <!-- LEFT: Team A timeouts -->
    <div class="timeouts left">
      <div class="label">Timeouts</div>
      <div class="pips" @click="store.adjustTimeouts('A', -1)">
        <span
          v-for="n in MAX"
          :key="n"
          class="pip"
          :class="{ on: n <= scoreboard.timeoutsA }"
        />
      </div>
      <div class="controls">
        <IconButton name="minus" :icon-size="28" @click.stop="store.adjustTimeouts('A', -1)" />
        <IconButton name="plus" :icon-size="28" @click.stop="store.adjustTimeouts('A', 1)" />
      </div>
    </div>

    <!-- CENTER: possession + down & distance -->
    <div class="center">
      <div class="possession">
        <Icon
          name="arrowBigLeft"
          class="arrow"
          :class="{ active: scoreboard.possession === 'A' }"
          :size="64"
          @click="store.setPossession('A')"
        />

        <div class="down-distance">
          <div class="dd-block">
            <div class="label">Down</div>
            <div class="value" @click="store.adjustDown(1)">
              {{ ordinal(scoreboard.down) }}
            </div>
          </div>
          <div class="amp">&amp;</div>
          <div class="dd-block">
            <div class="label">To Go</div>
            <div class="value" @click="store.adjustToGo(1)">
              {{ scoreboard.toGo === 0 ? 'Goal' : scoreboard.toGo }}
            </div>
          </div>
        </div>

        <Icon
          name="arrowBigRight"
          class="arrow"
          :class="{ active: scoreboard.possession === 'B' }"
          :size="64"
          @click="store.setPossession('B')"
        />
      </div>

      <div class="dd-controls">
        <IconButton name="minus" :icon-size="28" @click.stop="store.adjustDown(-1)" />
        <button type="button" class="first-down" @click="store.firstDown()">
          1st &amp; 10
        </button>
        <IconButton name="minus" :icon-size="28" @click.stop="store.adjustToGo(-1)" />
        <IconButton name="plus" :icon-size="28" @click.stop="store.adjustToGo(1)" />
      </div>
    </div>

    <!-- RIGHT: Team B timeouts -->
    <div class="timeouts right">
      <div class="label">Timeouts</div>
      <div class="pips" @click="store.adjustTimeouts('B', -1)">
        <span
          v-for="n in MAX"
          :key="n"
          class="pip"
          :class="{ on: n <= scoreboard.timeoutsB }"
        />
      </div>
      <div class="controls">
        <IconButton name="minus" :icon-size="28" @click.stop="store.adjustTimeouts('B', -1)" />
        <IconButton name="plus" :icon-size="28" @click.stop="store.adjustTimeouts('B', 1)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from '../../components/icons/Icon.vue';
import { useScoreboardStore } from '../../stores/scoreboard';
import { FOOTBALL_MAX_TIMEOUTS as MAX } from '../../engines/sportsEngine';
import type { FootballScoreboard } from '../../interfaces/scoreboard';

defineProps<{ scoreboard: FootballScoreboard }>();
const store = useScoreboardStore();

function ordinal(n: number) {
  return ['', '1st', '2nd', '3rd', '4th'][n] ?? String(n);
}
</script>

<style scoped>
.hud {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 30px;
  width: 1000px;
  opacity: 0.85;
  pointer-events: auto;
}

.label {
  font-size: 24px;
  opacity: 0.7;
}

.timeouts {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.pips {
  display: flex;
  gap: 12px;
  cursor: pointer;
}

.pip {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid currentColor;
  opacity: 0.25;
}

.pip.on {
  background: var(--color-warning, #f0b400);
  border-color: var(--color-warning, #f0b400);
  opacity: 1;
}

.controls,
.dd-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0.4;
}

.center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.possession {
  display: flex;
  align-items: center;
  gap: 30px;
}

.arrow {
  opacity: 0.2;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.arrow.active {
  opacity: 1;
}

.arrow:hover {
  transform: scale(1.05);
}

.down-distance {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dd-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 110px;
}

.dd-block .value {
  font-size: 64px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}

.amp {
  font-size: 40px;
  opacity: 0.4;
}

.first-down {
  font-size: 20px;
  padding: 4px 12px;
  background: transparent;
  color: inherit;
  border: 2px solid currentColor;
  border-radius: 8px;
  cursor: pointer;
}
</style>
