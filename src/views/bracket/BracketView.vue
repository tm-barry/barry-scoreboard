<template>
  <div class="bracket-view">
    <!-- Intro -->
    <section class="intro">
      <h2><Network :size="18" class="rotate-90" />Bracket</h2>
      <p>Create, manage, save, and load tournament brackets.</p>
    </section>

    <!-- Actions -->
    <section class="actions">
      <button class="primary-btn flex-btn" @click="createBracket">
        <Plus />Create New
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Network } from '@lucide/vue';
import { Plus } from '@lucide/vue';

const router = useRouter();

function createBracket() {
  router.push('/bracket/create');
}
</script>

<style scoped>
.bracket-view {
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

.actions {
  display: flex;
  justify-content: center;
}
</style>
