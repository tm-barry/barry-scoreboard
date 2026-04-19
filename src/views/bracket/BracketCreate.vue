<template>
  <div class="create-bracket">
    <h2>Create Bracket</h2>

    <!-- Bracket Name -->
    <section class="field">
      <label>Bracket Name (optional)</label>
      <input v-model="bracketName" type="text" placeholder="Enter a name..." />
    </section>

    <!-- Teams -->
    <section class="teams">
      <h3>Teams</h3>

      <div v-for="(team, index) in teams" :key="index" class="team-row">
        <div class="input-wrapper">
          <small class="row-index">{{ index + 1 }}.</small>
          <input v-model="team.name" type="text" placeholder="Team name" />
        </div>

        <input
          v-model.number="team.seed"
          type="number"
          min="1"
          placeholder="Seed"
        />

        <button
          type="button"
          class="danger icon-btn"
          @click="removeTeam(index)"
        >
          <Trash />
        </button>
      </div>

      <!-- Add Team -->
      <div class="team-actions">
        <button type="button" class="secondary-btn flex-btn" @click="addTeam">
          <Plus :size="18" /> Add Team
        </button>
      </div>
    </section>

    <!-- Generate -->
    <section class="actions">
      <button class="primary-btn flex-btn" @click="generateBracket">
        <Network :size="18" class="rotate-90" />Generate Bracket
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onActivated, ref } from 'vue';
import { Network, Plus, Trash } from '@lucide/vue';

type Team = {
  name: string;
  seed: number | null;
};

const bracketName = ref('');
const teams = ref<Team[]>([
  { name: '', seed: null },
  { name: '', seed: null },
]);

function addTeam() {
  teams.value.push({ name: '', seed: null });
}

function removeTeam(index: number) {
  if (teams.value.length > 2) teams.value.splice(index, 1);
}

function generateDefaultName() {
  const now = new Date();
  return `Bracket ${now.toISOString().slice(0, 16)}`;
}

function generateBracket() {
  const finalName = bracketName.value.trim() || generateDefaultName();

  const cleanTeams = teams.value.map((t, index) => {
    const name = t.name.trim() || `Team ${index + 1}`;

    return {
      name,
      seed: t.seed ?? 0,
    };
  });

  const payload = {
    name: finalName,
    teams: cleanTeams,
  };

  console.log('Generated bracket:', payload);

  // later:
  // store.createBracket(payload)
  // router.push(`/bracket/${id}`)
}

onActivated(() => {
  bracketName.value = '';
  teams.value = [
    { name: '', seed: null },
    { name: '', seed: null },
  ];
});
</script>

<style scoped>
.create-bracket {
  max-width: 700px;
  margin: 0 auto;
  padding: 24px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 24px;
}

.teams {
  margin-bottom: 24px;
}

.teams-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.team-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.input-wrapper {
  position: relative;
  flex: 1 1 180px;
  min-width: 120px;
  display: flex;
}

.row-index {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);

  font-size: 0.85rem;
  opacity: 0.5;
  pointer-events: none;
  font-variant-numeric: tabular-nums;
}

.input-wrapper input {
  width: 100%;
  padding-left: 50px;
}

.team-row input[type='number'] {
  flex: 0 0 auto;
  width: 8ch;
  text-align: center;
}

.icon-btn {
  flex: 0 0 auto;
  margin-left: auto;
}

.team-actions {
  display: flex;
  justify-content: flex-start;
  margin-top: 12px;
}

input {
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
}

.actions {
  display: flex;
  justify-content: flex-end;
}
</style>
