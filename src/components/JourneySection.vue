<script setup>
import { Award } from 'lucide-vue-next';

defineProps({
  stats: { type: Array, default: () => [] }
});
</script>

<template>
  <section class="bg-brand-900 py-16 text-white sm:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        <div class="lg:col-span-5 space-y-4">
          <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Award class="h-4 w-4" />
            <span>Global Impact</span>
          </div>
          <h2 class="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Our Journey to Excellence
          </h2>
          <p class="text-base text-slate-300 leading-relaxed">
            Trusted by learners and industry leaders worldwide, Meekoo continues to raise the bar for structured, mentor-led online education.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
          <div
            v-for="item in stats"
            :key="item.id"
            class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:bg-white/10"
          >
            <p class="text-3xl font-extrabold text-amber-400">
              {{ item.value_num }}{{ item.suffix || '' }}
            </p>
            <p class="mt-1 text-sm font-medium text-slate-200">{{ item.label }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
