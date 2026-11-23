<script setup>
import { ref, watch } from 'vue';
import { ChevronLeft, ChevronRight, Images } from 'lucide-vue-next';

const props = defineProps({
  images: { type: Array, required: true },
  title: { type: String, required: true },
  heading: { type: String, required: true }
});

const activeSlide = ref(0);

watch(
  () => props.images,
  () => {
    activeSlide.value = 0;
  }
);

function prevSlide() {
  if (props.images.length <= 1) return;
  activeSlide.value = (activeSlide.value - 1 + props.images.length) % props.images.length;
}

function nextSlide() {
  if (props.images.length <= 1) return;
  activeSlide.value = (activeSlide.value + 1) % props.images.length;
}
</script>

<template>
  <section
    v-if="images.length > 0"
    class="rounded-2xl border border-surface-border bg-white p-5 sm:p-6 shadow-card space-y-4"
  >
    <div class="flex items-center justify-between gap-2">
      <h2 class="inline-flex items-center gap-2 text-base font-extrabold text-brand-900">
        <Images class="h-4 w-4 text-brand-600" aria-hidden="true" />
        <span>{{ heading }}</span>
      </h2>
      <span class="text-xs font-bold text-slate-500">{{ activeSlide + 1 }} / {{ images.length }}</span>
    </div>

    <div class="relative overflow-hidden rounded-2xl border border-surface-border bg-slate-100">
      <img
        :src="images[activeSlide]"
        :alt="`${title} - Foto ${activeSlide + 1}`"
        class="aspect-[16/9] w-full object-cover"
      />
      <button
        v-if="images.length > 1"
        type="button"
        aria-label="Foto sebelumnya"
        class="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-900 shadow hover:bg-white"
        @click="prevSlide"
      >
        <ChevronLeft class="h-5 w-5" />
      </button>
      <button
        v-if="images.length > 1"
        type="button"
        aria-label="Foto berikutnya"
        class="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-900 shadow hover:bg-white"
        @click="nextSlide"
      >
        <ChevronRight class="h-5 w-5" />
      </button>
    </div>

    <div v-if="images.length > 1" class="flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="(thumb, idx) in images"
        :key="thumb + '-' + idx"
        type="button"
        class="shrink-0 overflow-hidden rounded-xl border-2 transition"
        :class="idx === activeSlide ? 'border-brand-600' : 'border-transparent opacity-70 hover:opacity-100'"
        @click="activeSlide = idx"
      >
        <img :src="thumb" :alt="`Thumbnail ${idx + 1}`" class="h-14 w-20 object-cover" />
      </button>
    </div>
  </section>
</template>
