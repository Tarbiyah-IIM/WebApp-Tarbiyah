<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from '../composables/useI18n.js';

const props = defineProps({
  stats: { type: Array, default: () => [] }
});

const { tr } = useI18n();

const containerRef = ref(null);
const animatedValues = ref({});
let observer = null;
let hasAnimated = false;

function parseNumericPart(str) {
  const match = String(str || '').match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  return { num: Number(match[1]), tail: match[2] || '' };
}

function startCountUp() {
  if (hasAnimated || !props.stats.length) return;
  hasAnimated = true;

  for (const stat of props.stats) {
    const parsed = parseNumericPart(stat.value_num);
    if (!parsed) {
      animatedValues.value[stat.id] = `${stat.value_num}${stat.suffix || ''}`;
      continue;
    }

    const duration = 900;
    const start = performance.now();
    const target = parsed.num;

    const tick = (now) => {
      const elapsed = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      const current = target % 1 === 0 ? Math.round(target * eased) : (target * eased).toFixed(1);
      animatedValues.value[stat.id] = `${current}${parsed.tail}${stat.suffix || ''}`;
      if (elapsed < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }
}

watch(
  () => props.stats,
  (list) => {
    for (const s of list) {
      if (!animatedValues.value[s.id]) {
        animatedValues.value[s.id] = `${s.value_num}${s.suffix || ''}`;
      }
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') {
    startCountUp();
    return;
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        startCountUp();
        observer?.disconnect();
      }
    },
    { threshold: 0.2 }
  );
  if (containerRef.value) {
    observer.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<template>
  <section ref="containerRef" class="border-y border-surface-border bg-white py-10">
    <div class="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
      <div
        v-for="stat in stats"
        :key="stat.id"
        class="rounded-2xl bg-surface-page p-5 text-center border border-surface-border/60"
      >
        <p class="text-3xl font-extrabold text-brand-700 sm:text-4xl">
          {{ animatedValues[stat.id] || `${stat.value_num}${stat.suffix || ''}` }}
        </p>
        <p class="mt-1 text-sm font-medium text-slate-600">{{ tr(stat.label) }}</p>
      </div>
    </div>
  </section>
</template>
