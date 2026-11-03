<template>
  <div class="hud basketball">
    <!-- LEFT (Team A) -->
    <div class="hud-side left">
      <div class="foul-block">
        <div class="label">Fouls</div>
        <div class="value" @click="store.adjustTeamFouls('A')">
          {{ scoreboard.foulsA }}
        </div>
        <div class="foul-controls">
          <IconButton
            name="minus"
            :icon-size="36"
            @click.stop="store.adjustTeamFouls('A', -1)"
          />
          <IconButton
            name="plus"
            :icon-size="36"
            @click.stop="store.adjustTeamFouls('A')"
          />
        </div>
      </div>
    </div>

    <!-- CENTER (Possession) -->
    <div class="hud-center">
      <Icon
        name="arrowBigLeft"
        class="arrow"
        :class="{ active: scoreboard.possession === 'A' }"
        :size="64"
        @click="store.setPossession('A')"
      />
      <Icon
        name="arrowBigRight"
        class="arrow"
        :class="{ active: scoreboard.possession === 'B' }"
        :size="64"
        @click="store.setPossession('B')"
      />
    </div>

    <!-- RIGHT (Team B) -->
    <div class="hud-side right">
      <div class="foul-block">
        <div class="label">Fouls</div>
        <div class="value" @click="store.adjustTeamFouls('B')">
          {{ scoreboard.foulsB }}
        </div>
        <div class="foul-controls">
          <IconButton
            name="minus"
            :icon-size="36"
            @click.stop="store.adjustTeamFouls('B', -1)"
          />
          <IconButton
            name="plus"
            :icon-size="36"
            @click.stop="store.adjustTeamFouls('B')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from '../../components/icons/Icon.vue';
import { useScoreboardStore } from '../../stores/scoreboard';
import type { BasketballScoreboard } from '../../interfaces/scoreboard';

defineProps<{ scoreboard: BasketballScoreboard }>();
const store = useScoreboardStore();
</script>

<style scoped>
.hud {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 600px;
  opacity: 0.75;
}

.foul-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: auto;
}

.foul-block .label {
  font-size: 24px;
}

.foul-block .value {
  font-size: 64px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}

.foul-controls {
  display: flex;
  gap: 10px;
  opacity: 0.4;
}

.hud-center {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  pointer-events: auto;
}

.arrow {
  opacity: 0.2;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.arrow.active {
  opacity: 1;
}

.arrow:hover {
  transform: scale(1.05);
}

.hud-side {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
</style>
