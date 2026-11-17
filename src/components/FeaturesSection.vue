<script setup>
import { CheckCircle2, TrendingUp } from 'lucide-vue-next';

defineProps({
  features: { type: Array, default: () => [] }
});
</script>

<template>
  <section id="features" class="bg-white py-16 sm:py-20">
    <div class="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
      <div class="relative lg:col-span-6">
        <div class="relative mx-auto max-w-lg">
          <div class="overflow-hidden rounded-3xl border border-surface-border bg-brand-50 p-3 shadow-card">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=950&q=80"
              alt="Learner tracking progress on Meekoo dashboard"
              loading="lazy"
              class="aspect-[4/3] w-full rounded-2xl object-cover"
            />
          </div>

          <div class="animate-float-slow absolute -bottom-5 left-4 sm:left-6 w-56 rounded-2xl border border-surface-border bg-white p-4 shadow-float">
            <div class="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Course Progress</span>
              <span class="text-brand-700 font-bold">55%</span>
            </div>
            <div class="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div class="h-full w-[55%] rounded-full bg-brand-600" />
            </div>
            <p class="mt-2 text-[11px] text-slate-500">11 of 20 lessons completed</p>
          </div>

          <div class="animate-float-delayed absolute -top-5 right-4 sm:right-6 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-float">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp class="h-5 w-5" />
            </div>
            <div>
              <p class="text-lg font-extrabold text-brand-900">25.20%</p>
              <p class="text-xs text-slate-500">Weekly Skill Growth</p>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-6 space-y-6">
        <span class="rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
          Powerful Features
        </span>
        <h2 class="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
          Everything You Need to Learn, Connect & Grow
        </h2>
        <p class="text-base text-slate-600">
          From personalized learning roadmaps to live mentor sessions and active peer discussions, every part of Meekoo stays synchronized.
        </p>

        <ul class="space-y-4">
          <li
            v-for="item in features"
            :key="item.id"
            class="flex items-start gap-3.5 rounded-2xl border border-surface-border bg-surface-page p-4"
          >
            <CheckCircle2 class="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <h3 class="text-base font-bold text-brand-900">{{ item.title }}</h3>
              <p class="mt-1 text-sm text-slate-600">{{ item.description }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
