<template>
  <input
    ref="inputRef"
    class="time-input"
    :value="text"
    inputmode="numeric"
    placeholder="MM:SS"
    @input="onInput"
    @blur="commit"
    @keydown.enter="commit"
    @keydown.esc="reset"
  />
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

const props = defineProps<{
  modelValue: number; // ms
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);

const internalMs = ref(props.modelValue);
const text = ref(format(internalMs.value));

watch(
  () => props.modelValue,
  (v) => {
    internalMs.value = v;
    text.value = format(v);
  },
);

function format(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const hundredths = Math.floor((ms % 1000) / 10);

  const base = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // show decimals only when meaningful
  if (ms < 10000 && ms > 0) {
    return `${base}.${hundredths.toString().padStart(2, '0')}`;
  }

  return base;
}

function parse(input: string): number | null {
  const cleaned = input.trim().replace(/[^\d:.]/g, '');

  const timeMatch = cleaned.match(/^(\d+):([0-5]?\d)(?:\.(\d{1,3}))?$/);
  if (timeMatch) {
    const m = Number(timeMatch[1]);
    const s = Number(timeMatch[2]);
    const fraction = timeMatch[3] ?? '0';

    // normalize fraction to milliseconds (up to 3 digits)
    const msFraction = Number((fraction + '000').slice(0, 3));

    return (m * 60 + s) * 1000 + msFraction;
  }

  if (/^\d+(\.\d+)?$/.test(cleaned)) {
    const seconds = Number(cleaned);
    return Math.round(seconds * 1000);
  }

  return null;
}

function onInput(e: Event) {
  const el = e.target as HTMLInputElement;
  const raw = el.value;

  text.value = raw;

  const parsed = parse(raw);
  if (parsed !== null) {
    internalMs.value = parsed;
  }
}

function commit() {
  const parsed = parse(text.value);

  if (parsed !== null) {
    emit('update:modelValue', parsed);
    text.value = format(parsed);
  } else {
    text.value = format(internalMs.value);
  }
}

function reset() {
  text.value = format(internalMs.value);
}

watch(text, async () => {
  await nextTick();

  const el = inputRef.value;
  if (!el) return;

  // keep cursor at end (simple but stable approach)
  el.setSelectionRange(el.value.length, el.value.length);
});
</script>
