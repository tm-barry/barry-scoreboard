<template>
  <div
    ref="viewportRef"
    class="viewport"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @wheel="onWheel"
  >
    <div class="content" :style="transformStyle">
      <slot
        :scale="scale"
        :offset-x="offsetX"
        :offset-y="offsetY"
        :apply-zoom="applyZoom"
        :reset="resetView"
        :fit="fitToView"
      />
    </div>

    <slot
      name="overlay"
      :scale="scale"
      :offset-x="offsetX"
      :offset-y="offsetY"
      :apply-zoom="applyZoom"
      :reset="resetView"
      :fit="fitToView"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    width: number;
    height: number;
    minZoom?: number;
    maxZoom?: number;
    padding?: number;
    fitSafePadding?: number;
  }>(),
  {
    minZoom: 0.5,
    maxZoom: 2.5,
    padding: 50,
    fitSafePadding: 16,
  },
);

const emit = defineEmits<{
  (e: 'drag-start'): void;
  (e: 'drag-end'): void;
}>();

const viewportRef = ref<HTMLElement | null>(null);

const scale = ref(1);
const offsetX = ref(0);
const offsetY = ref(0);

// pointer state
const pointers = new Map<number, PointerEvent>();
let isPanning = false;
let lastPan = { x: 0, y: 0 };
let pinchStartDistance = 0;

// drag
let dragStarted = false;

const transformStyle = computed(() => ({
  transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})`,
  transformOrigin: '0 0',
}));

// --------------------
// Pointer utilities
// --------------------

function getPointerList() {
  return Array.from(pointers.values());
}

function getDistance() {
  const [a, b] = getPointerList();
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function getMidpoint() {
  const [a, b] = getPointerList();
  return {
    x: (a.clientX + b.clientX) / 2,
    y: (a.clientY + b.clientY) / 2,
  };
}

// --------------------
// Interaction
// --------------------

function onPointerDown(e: PointerEvent) {
  pointers.set(e.pointerId, e);
  (e.target as HTMLElement).setPointerCapture(e.pointerId);

  if (pointers.size === 1) {
    isPanning = true;
    lastPan = { x: e.clientX, y: e.clientY };

    // reset drag state for new gesture
    dragStarted = false;
  }

  if (pointers.size === 2) {
    isPanning = false;
    pinchStartDistance = getDistance();
  }
}

function onPointerMove(e: PointerEvent) {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, e);

  // Pinch Zoom
  if (pointers.size === 2) {
    const dist = getDistance();
    const mid = getMidpoint();

    if (pinchStartDistance) {
      const delta = dist / pinchStartDistance;
      applyZoom(scale.value * delta, mid.x, mid.y);
    }

    pinchStartDistance = dist;
    return;
  }

  // Pan
  if (pointers.size === 1 && isPanning) {
    const dx = e.clientX - lastPan.x;
    const dy = e.clientY - lastPan.y;

    // detect actual drag movement
    if (!dragStarted && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      dragStarted = true;
      emit('drag-start');
    }

    offsetX.value += dx;
    offsetY.value += dy;

    lastPan = { x: e.clientX, y: e.clientY };

    clamp();
  }
}

function onPointerUp(e: PointerEvent) {
  pointers.delete(e.pointerId);

  if (pointers.size < 2) {
    pinchStartDistance = 0;
  }

  if (pointers.size === 0) {
    isPanning = false;

    if (dragStarted) {
      emit('drag-end');
    }

    dragStarted = false;
  }

  (e.target as HTMLElement).releasePointerCapture(e.pointerId);
}

// --------------------
// Zoom
// --------------------

function onWheel(e: WheelEvent) {
  e.preventDefault();

  const zoomIntensity = 0.002;
  const delta = -e.deltaY * zoomIntensity;

  applyZoom(scale.value * (1 + delta), e.clientX, e.clientY);
}

function applyZoom(newScale: number, cx: number, cy: number) {
  const clamped = Math.min(props.maxZoom, Math.max(props.minZoom, newScale));

  const factor = clamped / scale.value;

  offsetX.value = cx - (cx - offsetX.value) * factor;
  offsetY.value = cy - (cy - offsetY.value) * factor;

  scale.value = clamped;

  clamp();
}

// --------------------
// View controls
// --------------------

function resetView() {
  scale.value = 1;
  offsetX.value = 0;
  offsetY.value = 0;
}

function fitToView() {
  const viewport = viewportRef.value;
  if (!viewport) return;

  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;

  const contentW = props.width + props.fitSafePadding * 2;
  const contentH = props.height + props.fitSafePadding * 2;

  let newScale = Math.min(vw / contentW, vh / contentH);

  newScale = Math.max(props.minZoom, Math.min(props.maxZoom, newScale));

  scale.value = newScale;

  offsetX.value = (vw - contentW * newScale) / 2;
  offsetY.value = (vh - contentH * newScale) / 2;

  clamp();
}

// --------------------
// Clamp
// --------------------

function clamp() {
  const viewport = viewportRef.value;
  if (!viewport) return;

  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;

  const worldW = props.width * scale.value;
  const worldH = props.height * scale.value;

  const minX = -worldW + props.padding;
  const maxX = vw - props.padding;

  const minY = -worldH + props.padding;
  const maxY = vh - props.padding;

  if (minX > maxX) {
    offsetX.value = (minX + maxX) / 2;
  } else {
    offsetX.value = Math.min(maxX, Math.max(minX, offsetX.value));
  }

  if (minY > maxY) {
    offsetY.value = (minY + maxY) / 2;
  } else {
    offsetY.value = Math.min(maxY, Math.max(minY, offsetY.value));
  }
}

// auto-fit on mount
onMounted(() => {
  fitToView();
});
</script>

<style scoped>
.viewport {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: none;
}

.content {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
}
</style>
