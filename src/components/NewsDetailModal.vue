<script setup>
import { computed } from 'vue';
import { Calendar, Clock, MapPin } from 'lucide-vue-next';
import gedungIimFallback from '../assets/gedung-iim.jpg';
import ModalDialog from './ModalDialog.vue';
import NewsGallerySlideshow from './NewsGallerySlideshow.vue';
import { useI18n } from '../composables/useI18n.js';

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: null },
  badgeFallback: { type: String, default: '' }
});

const emit = defineEmits(['close']);
const { t, tr } = useI18n();

const displayTitle = computed(() => (props.item ? tr(props.item.name || props.item.title || '') : ''));
const displayDate = computed(() => (props.item ? tr(props.item.job_title || props.item.event_date || '') : ''));
const displayTime = computed(() => (props.item?.event_time ? tr(props.item.event_time) : ''));
const displayLocation = computed(() => (props.item?.location ? tr(props.item.location) : ''));
const displayCover = computed(() => props.item?.avatar_url || props.item?.cover_url || gedungIimFallback);

const gallery = computed(() => (Array.isArray(props.item?.gallery_urls) ? props.item.gallery_urls : []));
const slideshowPos = computed(() => props.item?.slideshow_position || 'bottom');
const showSlideshow = computed(() => gallery.value.length > 0 && slideshowPos.value !== 'none');

const categories = computed(() => {
  if (!props.item) return [];
  if (Array.isArray(props.item.categories) && props.item.categories.length > 0) {
    return props.item.categories;
  }
  if (props.item.category_name) {
    return [{ id: props.item.category_id || 0, name: props.item.category_name }];
  }
  if (props.badgeFallback) {
    return [{ id: 0, name: props.badgeFallback }];
  }
  return [];
});

const contentParagraphs = computed(() => {
  if (!props.item) return [];
  const raw = tr(
    props.item.full_content || props.item.description || props.item.quote || props.item.excerpt || ''
  );
  return String(raw)
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
});

const splitParagraphs = computed(() => {
  const list = contentParagraphs.value;
  if (slideshowPos.value !== 'middle' || !showSlideshow.value) {
    return { before: list, middleSlideshow: false, after: [] };
  }
  if (list.length <= 1) {
    return { before: [], middleSlideshow: true, after: list };
  }
  const mid = Math.ceil(list.length / 2);
  return {
    before: list.slice(0, mid),
    middleSlideshow: true,
    after: list.slice(mid)
  };
});
</script>

<template>
  <ModalDialog
    :open="open"
    :title="displayTitle"
    header-variant="macos"
    @close="emit('close')"
  >
    <article v-if="item" class="space-y-5">
      <header class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-for="cat in categories"
            :key="cat.id + '-' + cat.name"
            class="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700"
          >
            {{ tr(cat.name) }}
          </span>
          <span v-if="displayDate" class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Calendar class="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
            <span>{{ displayDate }}</span>
          </span>
          <span v-if="displayTime" class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Clock class="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
            <span>{{ displayTime }}</span>
          </span>
          <span v-if="displayLocation" class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <MapPin class="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            <span>{{ displayLocation }}</span>
          </span>
        </div>

        <div class="overflow-hidden rounded-2xl border border-surface-border bg-slate-100">
          <img
            :src="displayCover"
            :alt="displayTitle"
            class="aspect-[16/9] w-full object-cover"
          />
        </div>
      </header>

      <NewsGallerySlideshow
        v-if="showSlideshow && slideshowPos === 'top'"
        :images="gallery"
        :title="displayTitle"
        :heading="t('news.galleryHeading')"
      />

      <div class="space-y-4">
        <p
          v-for="(paragraph, idx) in splitParagraphs.before"
          :key="'before-' + idx"
          class="whitespace-pre-line text-sm leading-relaxed text-slate-700 sm:text-base"
        >
          {{ paragraph }}
        </p>

        <NewsGallerySlideshow
          v-if="splitParagraphs.middleSlideshow"
          :images="gallery"
          :title="displayTitle"
          :heading="t('news.galleryHeading')"
        />

        <p
          v-for="(paragraph, idx) in splitParagraphs.after"
          :key="'after-' + idx"
          class="whitespace-pre-line text-sm leading-relaxed text-slate-700 sm:text-base"
        >
          {{ paragraph }}
        </p>
      </div>

      <NewsGallerySlideshow
        v-if="showSlideshow && slideshowPos === 'bottom'"
        :images="gallery"
        :title="displayTitle"
        :heading="t('news.galleryHeading')"
      />
    </article>
  </ModalDialog>
</template>
