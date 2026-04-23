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
    <!-- Ball -->
    <circle
      id="circle1"
      cx="16.970562"
      cy="1.7763568e-15"
      r="9"
      transform="rotate(45)"
    />
    <!-- Left seam -->
    <path
      id="path1"
      d="m 20.838835,10.93934 c -3.889088,0.353553 -9.545942,6.010407 -9.899495,9.899495"
    />
    <!-- Right seam -->
    <path
      id="path2"
      d="M 13.06066,3.1611652 C 12.707107,7.0502525 7.0502525,12.707107 3.1611652,13.06066"
    />
    <!-- Left seam stitches (angled along curve) -->
    <path id="path3" d="m 18.081118,11.292893 -0.07071,1.202082" />
    <path id="path4" d="m 15.818377,12.989949 -0.07071,1.202082" />
    <path id="path5" d="m 13.697056,15.11127 -0.07071,1.202081" />
    <path id="path6" d="m 12,17.374012 -0.07071,1.202081" />
    <!-- Right seam stitches (mirrored alignment) -->
    <path id="path7" d="m 12.707107,5.9188817 -1.202082,0.070711" />
    <path id="path8" d="M 11.010051,8.1816234 9.807969,8.2523341" />
    <path id="path9" d="m 8.8887302,10.302944 -1.2020816,0.07071" />
    <path id="path10" d="m 6.6259885,12 -1.2020816,0.07071" />
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
