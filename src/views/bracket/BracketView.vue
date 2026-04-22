<template>
  <div class="bracket-view">
    <!-- Intro -->
    <section class="intro">
      <h2>
        <Network :size="18" class="rotate-90" />
        Bracket
      </h2>
      <p>Create, manage, save, and load tournament brackets.</p>
    </section>

    <!-- Actions -->
    <section class="actions">
      <button class="primary-btn flex-btn" @click="createBracket">
        <Plus />
        Create New
      </button>
    </section>

    <!-- List -->
    <section class="list">
      <div v-if="brackets.length === 0" class="empty">
        No saved brackets yet.
      </div>

      <div
        v-for="b in brackets"
        :key="b.id"
        class="card bracket-item"
        @click="openBracket(b.id)"
      >
        <!-- click to open -->
        <div class="bracket-info">
          <h3>{{ b.name }}</h3>
          <small>
            {{ b.teams.length }} teams •
            {{ new Date(b.updatedAt).toLocaleDateString() }}
          </small>
        </div>

        <!-- delete -->
        <button class="icon-btn danger" @click.stop="confirmDelete(b.id)">
          <Trash />
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onActivated, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBracketStore } from '../../stores/bracket';
import { Network, Plus, Trash } from '@lucide/vue';

const router = useRouter();
const store = useBracketStore();

const brackets = computed(() => store.brackets);

onActivated(async () => {
  await store.loadBrackets();
});

function createBracket() {
  router.push('/bracket/create');
}

function openBracket(id: string) {
  const bracket = store.brackets.find((b) => b.id === id);
  if (!bracket) return;

  store.setCurrentBracket(bracket);
  router.push({ name: 'bracket-manage' });
}

async function confirmDelete(id: string) {
  const ok = window.confirm(
    'Are you sure you want to delete this bracket? This cannot be undone.',
  );

  if (!ok) return;

  await store.deleteBracket(id);
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
.list {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bracket-item {
  display: flex;
  align-items: center;
  padding: 14px;
  cursor: pointer;
}

.bracket-info h3 {
  margin: 0;
}

.bracket-info small {
  opacity: 0.7;
}

.icon-btn {
  flex: 0 0 auto;
  margin-left: auto;
}

.empty {
  text-align: center;
  opacity: 0.7;
  padding: 24px;
}
</style>
