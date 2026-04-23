<template>
  <div class="scoreboard-view">
    <!-- Intro -->
    <section class="intro">
      <h2>
        <Monitor :size="18" />
        Scoreboard Play
      </h2>
      <p>Play ball!</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Monitor } from '@lucide/vue';
</script>

<style scoped>
.scoreboard-play {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

/* Intro */
.intro {
  text-align: center;
  margin-bottom: 32px;
}

.intro h2 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.intro p {
  opacity: 0.8;
  line-height: 1.5;
}
</style>
