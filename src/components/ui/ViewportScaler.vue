<template>
  <div ref="viewportRef" class="viewport">
    <div
      ref="scaleWrapper"
      class="scale-wrapper"
      :style="{
        width: width + 'px',
        height: height + 'px',
      }"
    >
      <slot :scale="scale" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    width?: number;
    height?: number;
  }>(),
  {
    width: 1280,
    height: 720,
  },
);

const viewportRef = ref<HTMLElement | null>(null);
const scaleWrapper = ref<HTMLElement | null>(null);
const scale = ref(1);

let ro: ResizeObserver | null = null;

function updateScale() {
  if (!viewportRef.value || !scaleWrapper.value) return;

  const vw = viewportRef.value.clientWidth;
  const vh = viewportRef.value.clientHeight;

  const nextScale = Math.min(vw / props.width, vh / props.height);
  scale.value = nextScale;

  const x = (vw - props.width * nextScale) / 2;
  const y = (vh - props.height * nextScale) / 2;

  scaleWrapper.value.style.transform = `translate(${x}px, ${y}px) scale(${nextScale})`;
}

onMounted(() => {
  updateScale();

  ro = new ResizeObserver(updateScale);
  if (viewportRef.value) {
    ro.observe(viewportRef.value);
  }
});

watch(
  () => [props.width, props.height],
  () => {
    updateScale();
  },
);

onUnmounted(() => {
  ro?.disconnect();
  ro = null;
});
</script>

<style scoped>
.viewport {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg);
}

.scale-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
}
</style>
