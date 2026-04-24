<template>
  <Teleport to="body">
    <div v-if="isOpen" class="backdrop" @click="confirm.onCancel">
      <div class="modal" @click.stop>
        <h3 v-if="options?.title">
          {{ options.title }}
        </h3>

        <p>{{ options?.message }}</p>

        <div class="actions">
          <button class="secondary-btn" @click="confirm.onCancel">
            {{ options?.cancelText ?? 'Cancel' }}
          </button>

          <button
            :class="{
              'danger-btn': options?.danger,
              'primary-btn': !options?.danger,
            }"
            @click="confirm.onConfirm"
          >
            {{ options?.confirmText ?? 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useConfirm } from '../../composables/useConfirm';

const confirm = useConfirm();
const isOpen = computed(() => confirm.isOpen.value);
const options = computed(() => confirm.options.value);
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 9999;
}

.modal {
  width: min(420px, 90vw);
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;

  box-shadow: var(--shadow);
}

h3 {
  margin: 0 0 10px;
  font-size: 18px;
}

p {
  margin: 0 0 16px;
  opacity: 0.8;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

button {
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
</style>
