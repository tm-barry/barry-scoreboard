<template>
  <button
    class="icon-btn"
    :class="{ disabled: disabled }"
    :style="buttonStyle"
    :aria-label="label"
    :disabled="disabled"
  >
    <Icon :name="name" :size="iconSize" :class="iconClass" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type IconName } from '../icons/icons';

const props = withDefaults(
  defineProps<{
    name: IconName;
    iconSize?: number;
    buttonPadding?: number;
    label?: string;
    iconClass?: string;
    disabled?: boolean;
  }>(),
  {
    iconSize: 24,
    buttonPadding: 8,
    label: undefined,
    iconClass: undefined,
    disabled: false,
  },
);

const buttonStyle = computed(() => ({
  width: `${props.iconSize + props.buttonPadding * 2}px`,
  height: `${props.iconSize + props.buttonPadding * 2}px`,
}));
</script>

<style scoped>
.icon-btn {
  color: var(--text-h);
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.icon-btn.disabled {
  opacity: 0.35;
  cursor: not-allowed;
  color: var(--text-secondary);
  transform: none;
  pointer-events: none;
}
</style>
