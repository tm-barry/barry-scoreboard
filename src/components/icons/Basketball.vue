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
    <!-- outer ball -->
    <circle
      id="circle1"
      cx="16.970562"
      cy="-3.3717478e-07"
      r="9"
      transform="rotate(45)"
    />
    <!-- vertical seam -->
    <path
      id="path1"
      d="M 18.363961,5.6360387 C 16.24264,7.7573588 7.7573585,16.242641 5.6360389,18.36396"
    />
    <!-- horizontal seam -->
    <path
      id="path2"
      d="M 5.6360391,5.6360385 C 7.7573593,7.7573588 16.242641,16.242641 18.363961,18.36396"
    />
    <!-- left curved seam (tighter) -->
    <path
      id="path3"
      d="m 20.62197,13.392041 c -5.260004,-1.645039 -8.874969,1.969926 -7.22993,7.229931"
      style="stroke-width: 2.28042"
    />
    <path
      id="path3-6"
      d="M 3.1790781,10.567873 C 8.4390823,12.212912 12.054048,8.5979467 10.409009,3.3379418"
      style="stroke-width: 2.28042"
      inkscape:label="path4"
    />
    <!-- right curved seam (tighter mirror) -->
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
