<script setup>
import { Star, Quote } from 'lucide-vue-next';

defineProps({
  testimonials: { type: Array, default: () => [] }
});
</script>

<template>
  <section id="testimonials" class="py-16 sm:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-2xl text-center">
        <span class="rounded-full bg-amber-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
          Learner Stories
        </span>
        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
          What Our Learners Are Saying
        </h2>
        <p class="mt-3 text-base text-slate-600">
          Verified reviews from professionals and students leveling up their careers on Meekoo.
        </p>
      </div>

      <div class="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="item in testimonials"
          :key="item.id"
          class="flex flex-col justify-between rounded-2xl border border-surface-border bg-white p-6 shadow-card"
        >
          <div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1" :aria-label="`${item.rating} out of 5 stars`">
                <Star
                  v-for="n in item.rating"
                  :key="n"
                  class="h-4 w-4 fill-amber-400 text-amber-400"
                />
              </div>
              <Quote class="h-5 w-5 text-brand-200" />
            </div>
            <p class="mt-4 text-sm leading-relaxed text-slate-700">
              "{{ item.quote }}"
            </p>
          </div>

          <div class="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
            <img
              :src="item.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(item.name)}`"
              :alt="item.name"
              loading="lazy"
              class="h-10 w-10 rounded-full bg-slate-100 object-cover"
            />
            <div>
              <p class="text-sm font-bold text-brand-900">{{ item.name }}</p>
              <p class="text-xs text-slate-500">{{ item.job_title }}</p>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
