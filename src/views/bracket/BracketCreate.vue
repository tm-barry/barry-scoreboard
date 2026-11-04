<template>
  <div class="create-bracket">
    <h2>{{ isEditing ? 'Edit Bracket' : 'Create Bracket' }}</h2>

    <!-- Bracket Name -->
    <section class="field">
      <label>Bracket Name{{ isEditing ? '' : ' (optional)' }}</label>
      <input v-model="bracketName" type="text" placeholder="Enter a name..." />
    </section>

    <section class="field">
      <label>Sport</label>

      <select v-model="sport">
        <option v-for="s in SPORTS" :key="s.type" :value="s.type">
          {{ s.label }}
        </option>
      </select>
    </section>

    <!-- Teams -->
    <section class="teams">
      <label>Teams</label>
      <small v-if="isEditing" class="hint">
        Names can be changed. Teams and seeds are fixed once a bracket is
        created.
      </small>

      <div
        v-for="(team, index) in teams"
        :key="team.id || index"
        class="team-row"
      >
        <div class="input-wrapper">
          <small class="row-index">{{ index + 1 }}.</small>
          <input v-model="team.name" type="text" placeholder="Team name" />
        </div>

        <input
          v-model.number="team.seed"
          type="number"
          min="1"
          placeholder="Seed"
          :disabled="isEditing"
        />

        <IconButton
          v-if="!isEditing"
          name="trash"
          class="danger trash-btn"
          @click="removeTeam(index)"
        />
      </div>

      <!-- Add Team -->
      <div v-if="!isEditing" class="team-actions">
        <button type="button" class="secondary-btn flex-btn" @click="addTeam">
          <Icon name="plus" :size="18" /> Add Team
        </button>
      </div>
    </section>

    <!-- Generate / Save -->
    <section class="actions">
      <button
        v-if="isEditing"
        type="button"
        class="secondary-btn flex-btn"
        @click="router.back()"
      >
        Cancel
      </button>
      <button class="primary-btn flex-btn" @click="submit">
        <template v-if="isEditing">
          <Icon name="check" :size="18" />Save Changes
        </template>
        <template v-else>
          <Icon name="network" :size="18" class="rotate-90" />Generate Bracket
        </template>
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createId } from '../../utils/id';
import { useBracketStore } from '../../stores/bracket';

// Interfaces
import type { Bracket, Team } from '../../interfaces/bracket';
import { SPORTS } from '../../interfaces/common';
import type { SportType } from '../../interfaces/common';

// Engines
import { generateSingleEliminationMatches } from '../../engines/bracketEngine';

const bracketStore = useBracketStore();
const router = useRouter();
const route = useRoute();

// Same component serves both routes: 'bracket-create' and 'bracket-edit'
const isEditing = computed(() => route.name === 'bracket-edit');

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

function submit() {
  return isEditing.value ? saveChanges() : generateBracket();
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

/**
 * Edit mode: only the name, sport and team NAMES change. Team ids, seeds,
 * matches and winners are left exactly as they were, so the bracket
 * structure can't be disturbed.
 */
async function saveChanges() {
  const current = bracketStore.currentBracket;
  if (!current) return;

  // Deep copy (JSON round trip also strips Vue's reactive proxies)
  const updated: Bracket = JSON.parse(JSON.stringify(current));

  updated.name = bracketName.value.trim() || current.name;
  updated.sport = sport.value;

  for (const team of updated.teams) {
    const edited = teams.value.find((t) => t.id === team.id);
    team.name = edited?.name.trim() || team.name; // blank keeps the old name
  }

  updated.updatedAt = Date.now();

  bracketStore.setCurrentBracket(updated);
  await bracketStore.saveCurrent();
  router.replace({ name: 'bracket-manage' });
}

onMounted(() => {
  if (isEditing.value) {
    const current = bracketStore.currentBracket;

    // Nothing loaded (e.g. page refresh): send them back to the list
    if (!current) {
      router.replace({ name: 'bracket' });
      return;
    }

    bracketName.value = current.name;
    sport.value = current.sport;
    teams.value = current.teams.map((t) => ({ ...t }));
    return;
  }

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

.hint {
  display: block;
  opacity: 0.7;
  margin: 4px 0 12px;
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

.team-row input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  gap: 8px;
}
</style>
