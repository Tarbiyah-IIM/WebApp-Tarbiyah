<script setup>
import { PlayCircle, Star, ShoppingBag, ArrowRight } from 'lucide-vue-next';
import { useFormatters } from '../composables/useFormatters.js';

defineProps({
  course: { type: Object, required: true }
});

defineEmits(['add-to-cart']);

const { formatPrice } = useFormatters();
</script>

<template>
  <article
    class="group flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-float"
  >
    <router-link :to="`/courses/${course.slug}`" class="relative block aspect-[16/10] overflow-hidden bg-slate-100">
      <img
        :src="course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80'"
        :alt="course.title"
        loading="lazy"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />
      <span
        v-if="course.badge"
        class="absolute top-3 left-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900 shadow-sm"
      >
        {{ course.badge }}
      </span>
    </router-link>

    <div class="flex flex-1 flex-col p-5">
      <div class="mb-2 flex items-center justify-between gap-2">
        <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          {{ course.category_name }}
        </span>
        <span class="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
          <PlayCircle class="h-3.5 w-3.5 text-brand-600" />
          {{ course.total_videos || 0 }} videos
        </span>
      </div>

      <router-link :to="`/courses/${course.slug}`" class="mb-2 block">
        <h3 class="line-clamp-2 text-lg font-bold text-brand-900 transition group-hover:text-brand-600">
          {{ course.title }}
        </h3>
      </router-link>

      <p class="mb-4 line-clamp-2 text-sm text-slate-600">
        {{ course.subtitle || course.description }}
      </p>

      <div class="mt-auto space-y-4">
        <div class="flex items-center justify-between border-t border-slate-100 pt-3">
          <div class="flex items-center gap-2 min-w-0">
            <img
              :src="course.mentor_photo_url || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(course.mentor_name || 'M')}`"
              :alt="course.mentor_name"
              loading="lazy"
              class="h-7 w-7 rounded-full object-cover bg-slate-100 shrink-0"
            />
            <span class="truncate text-xs font-medium text-slate-700">{{ course.mentor_name }}</span>
          </div>
          <div class="flex items-center gap-1 text-xs font-semibold text-brand-900 shrink-0">
            <Star class="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{{ Number(course.rating_avg || 0).toFixed(1) }}</span>
            <span class="text-slate-500 font-normal">({{ course.rating_count || 0 }})</span>
          </div>
        </div>

        <div class="flex items-center justify-between gap-2">
          <span class="text-xl font-extrabold text-brand-900">
            {{ formatPrice(course.price, course.currency) }}
          </span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-surface-border bg-surface-muted px-3 text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition"
              :aria-label="`Add ${course.title} to cart`"
              @click="$emit('add-to-cart', course)"
            >
              <ShoppingBag class="h-4 w-4" />
            </button>
            <router-link
              :to="`/courses/${course.slug}`"
              class="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition"
            >
              Enroll
              <ArrowRight class="h-4 w-4" />
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
