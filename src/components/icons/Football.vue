<template>
  <svg
    :width="props.size"
    :height="props.size"
    viewBox="0 0 24 24"
    :stroke="props.color"
    fill="none"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- ball outline -->
    <ellipse
      id="ellipse1"
      cx="1.7763568e-15"
      cy="16.970562"
      rx="9"
      ry="6"
      transform="rotate(-45)"
    />
    <!-- end bands (straight lines) -->
    <path
      id="path1"
      d="m 5.7064789,13.484653 4.8088681,4.808868"
      style="stroke-width: 2.12928"
    />
    <path
      id="path2"
      d="m 13.502602,5.7244273 4.772971,4.7729707"
      style="stroke-width: 2.12132"
    />
    <!-- center seams (shortened) -->
    <path id="path3" d="m 9.1715729,13.414214 1.4142131,1.414213" />
    <path id="path4" d="m 10.93934,10.93934 2.12132,2.12132" />
    <path id="path5" d="m 13.414214,9.1715729 1.414213,1.4142131" />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  size?: number | string;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'currentColor',
});
</script>
