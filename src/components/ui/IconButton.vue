<template>
  <button class="icon-btn" :style="buttonStyle" :aria-label="label">
    <Icon :name="name" :size="iconSize" />
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
  }>(),
  {
    iconSize: 24,
    buttonPadding: 8,
    label: undefined,
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
</style>
