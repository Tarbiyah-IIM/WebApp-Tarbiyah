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
  const raw = String(str || '').trim();
  const groupedMatch = raw.match(/^(\d{1,3}(?:\.\d{3})+)(.*)$/);
  if (groupedMatch) {
    return {
      num: Number(groupedMatch[1].replace(/\./g, '')),
      tail: groupedMatch[2] || '',
      useIndonesianThousands: true,
      decimals: 0
    };
  }
  const match = raw.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const decimalPart = match[1].includes('.') ? match[1].split('.')[1].length : 0;
  return {
    num: Number(match[1]),
    tail: match[2] || '',
    useIndonesianThousands: false,
    decimals: decimalPart
  };
}

function formatAnimatedNumber(value, parsed) {
  if (parsed.useIndonesianThousands) {
    return Math.round(value).toLocaleString('id-ID');
  }
  if (parsed.decimals > 0) {
    return value.toFixed(parsed.decimals);
  }
  return String(Math.round(value));
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
      if (elapsed >= 1) {
        animatedValues.value[stat.id] = `${stat.value_num}${stat.suffix || ''}`;
        return;
      }
      const eased = 1 - Math.pow(1 - elapsed, 3);
      const current = formatAnimatedNumber(target * eased, parsed);
      animatedValues.value[stat.id] = `${current}${parsed.tail}${stat.suffix || ''}`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

watch(
  () => props.stats,
  (list) => {
    const nextMap = {};
    for (const s of list) {
      nextMap[s.id] = `${s.value_num}${s.suffix || ''}`;
    }
    animatedValues.value = nextMap;
  },
  { immediate: true, deep: true }
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
