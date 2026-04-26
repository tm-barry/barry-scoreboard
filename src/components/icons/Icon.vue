<template>
  <component :is="resolvedIcon" :size="size" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import icons from '../icons/icons';

type IconName = keyof typeof icons;

const props = withDefaults(
  defineProps<{
    name: IconName;
    size?: number;
  }>(),
  {
    size: 24,
  },
);

const resolvedIcon = computed(() => icons[props.name]);
</script>
