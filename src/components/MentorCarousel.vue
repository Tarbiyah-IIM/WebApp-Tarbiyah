<script setup>
import { ref } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

defineProps({
  mentors: { type: Array, default: () => [] }
});

const trackRef = ref(null);
const isDragging = ref(false);
let startX = 0;
let scrollStart = 0;

function scrollByCard(direction) {
  if (!trackRef.value) return;
  trackRef.value.scrollBy({
    left: direction * 320,
    behavior: 'smooth'
  });
}

function onPointerDown(e) {
  if (!trackRef.value) return;
  isDragging.value = true;
  startX = e.pageX - trackRef.value.offsetLeft;
  scrollStart = trackRef.value.scrollLeft;
}

function onPointerMove(e) {
  if (!isDragging.value || !trackRef.value) return;
  const x = e.pageX - trackRef.value.offsetLeft;
  trackRef.value.scrollLeft = scrollStart - (x - startX);
}

function stopDrag() {
  isDragging.value = false;
}
</script>

<template>
  <section id="mentors" class="py-16 sm:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span class="rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
            World-Class Instructors
          </span>
          <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
            Meet Our Expert Mentors
          </h2>
          <p class="mt-2 max-w-xl text-base text-slate-600">
            Learn from active practitioners leading AI, cybersecurity, engineering, design, and finance teams.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-surface-border bg-white text-brand-900 shadow-sm hover:bg-brand-50 transition"
            aria-label="Previous mentor"
            @click="scrollByCard(-1)"
          >
            <ChevronLeft class="h-5 w-5" />
          </button>
          <button
            type="button"
            class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-surface-border bg-white text-brand-900 shadow-sm hover:bg-brand-50 transition"
            aria-label="Next mentor"
            @click="scrollByCard(1)"
          >
            <ChevronRight class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref="trackRef"
        role="region"
        aria-label="Mentor Carousel"
        tabindex="0"
        class="mt-10 flex gap-6 overflow-x-auto pb-4 select-none snap-x snap-mandatory cursor-grab active:cursor-grabbing"
        @mousedown="onPointerDown"
        @mousemove="onPointerMove"
        @mouseup="stopDrag"
        @mouseleave="stopDrag"
      >
        <article
          v-for="mentor in mentors"
          :key="mentor.id"
          class="w-[280px] shrink-0 snap-start rounded-2xl border border-surface-border bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-float"
        >
          <div class="flex items-center gap-4">
            <img
              :src="mentor.photo_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(mentor.name)}`"
              :alt="mentor.name"
              loading="lazy"
              class="h-16 w-16 rounded-2xl bg-brand-50 object-cover border border-brand-100"
            />
            <div class="min-w-0">
              <h3 class="truncate text-base font-bold text-brand-900">{{ mentor.name }}</h3>
              <p class="text-xs font-semibold text-brand-600">{{ mentor.title }}</p>
            </div>
          </div>
          <p class="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600">
            {{ mentor.bio }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
