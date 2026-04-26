<template>
  <div class="create-bracket">
    <h2>Create Bracket</h2>

    <!-- Bracket Name -->
    <section class="field">
      <label>Bracket Name (optional)</label>
      <input v-model="bracketName" type="text" placeholder="Enter a name..." />
    </section>

    <section class="field">
      <label>Sport</label>

      <select v-model="sport">
        <option value="generic">Generic</option>
        <option value="baseball">Baseball</option>
        <option value="basketball">Basketball</option>
      </select>
    </section>

    <!-- Teams -->
    <section class="teams">
      <label>Teams</label>

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

        <IconButton
          name="trash"
          class="danger trash-btn"
          @click="removeTeam(index)"
        />
      </div>

      <!-- Add Team -->
      <div class="team-actions">
        <button type="button" class="secondary-btn flex-btn" @click="addTeam">
          <Icon name="plus" :size="18" /> Add Team
        </button>
      </div>
    </section>

    <!-- Generate -->
    <section class="actions">
      <button class="primary-btn flex-btn" @click="generateBracket">
        <Icon name="network" :size="18" class="rotate-90" />Generate Bracket
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { inject, onActivated, ref } from 'vue';
import { useRouter } from 'vue-router';
import { createId } from '../../utils/id';
import { useBracketStore } from '../../stores/bracket';

// Interfaces
import type { Bracket, Team } from '../../interfaces/bracket';
import type { SportType } from '../../interfaces/common';

// Engines
import { generateSingleEliminationMatches } from '../../engines/bracketEngine';

const bracketStore = useBracketStore();
const router = useRouter();

const scrollToBottom = inject<() => void>('scrollToBottom');

const bracketName = ref('');
const sport = ref<SportType>('generic');
const teams = ref<Team[]>([
  { id: '', name: '', seed: 1 },
  { id: '', name: '', seed: 2 },
]);

function addTeam() {
  const maxSeed =
    teams.value.length > 0
      ? Math.max(...teams.value.map((t) => t.seed ?? 0))
      : 0;
  teams.value.push({ id: '', name: '', seed: maxSeed + 1 });

  // Scroll to bottom in case new item goes off screen
  requestAnimationFrame(() => {
    scrollToBottom?.();
  });
}

function removeTeam(index: number) {
  if (teams.value.length > 2) teams.value.splice(index, 1);
}

function generateDefaultName() {
  const now = new Date();
  const local = now.toLocaleString('sv-SE').replace(' ', 'T').slice(0, 16);
  return `Bracket ${local}`;
}

async function generateBracket() {
  const finalName = bracketName.value.trim() || generateDefaultName();

  const cleanTeams: Team[] = teams.value.map((t, index) => {
    const name = t.name.trim() || `Team ${index + 1}`;

    return {
      id: createId(),
      name,
      seed: t.seed ?? 1,
    };
  });

  const now = Date.now();
  let bracket: Bracket = {
    id: createId(),
    name: finalName,
    sport: sport.value,
    teams: cleanTeams,
    matches: [],
    createdAt: now,
    updatedAt: now,
  };

  bracket = generateSingleEliminationMatches(bracket);
  bracketStore.setCurrentBracket(bracket);
  await bracketStore.saveCurrent();
  router.push({ name: 'bracket-manage' });
}

onActivated(() => {
  bracketName.value = '';
  sport.value = 'generic';
  teams.value = [
    { id: '', name: '', seed: 1 },
    { id: '', name: '', seed: 2 },
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

.trash-btn {
  flex: 0 0 auto;
  margin-left: auto;
}

.team-actions {
  display: flex;
  justify-content: flex-start;
  margin-top: 12px;
}

.actions {
  display: flex;
  justify-content: flex-end;
}
</style>
