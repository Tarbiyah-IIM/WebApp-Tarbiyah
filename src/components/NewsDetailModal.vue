<script setup>
import { computed } from 'vue';
import { Calendar, ExternalLink, Info } from 'lucide-vue-next';
import gedungIimFallback from '../assets/gedung-iim.jpg';
import ModalDialog from './ModalDialog.vue';
import NewsGallerySlideshow from './NewsGallerySlideshow.vue';
import { useI18n } from '../composables/useI18n.js';

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: null }
});

const emit = defineEmits(['close']);
const { t, tr } = useI18n();

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
  return [];
});

const contentParagraphs = computed(() => {
  if (!props.item) return [];
  const raw = tr(props.item.full_content || props.item.quote || '');
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
    :title="item ? tr(item.name) : ''"
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
          <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Calendar class="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
            <span>{{ tr(item.job_title) }}</span>
          </span>
        </div>

        <div class="overflow-hidden rounded-2xl border border-surface-border bg-slate-100">
          <img
            :src="item.avatar_url || gedungIimFallback"
            :alt="tr(item.name)"
            class="aspect-[16/9] w-full object-cover"
          />
        </div>

        <p class="rounded-xl border border-surface-border bg-surface-page px-4 py-3 text-sm font-medium leading-relaxed text-slate-600">
          {{ tr(item.quote) }}
        </p>
      </header>

      <NewsGallerySlideshow
        v-if="showSlideshow && slideshowPos === 'top'"
        :images="gallery"
        :title="tr(item.name)"
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
          :title="tr(item.name)"
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
        :title="tr(item.name)"
        :heading="t('news.galleryHeading')"
      />

      <div v-if="item.related_url" class="border-t border-surface-border pt-4">
        <a
          v-if="item.related_url !== '#'"
          :href="item.related_url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          <span>{{ t('news.relatedDocBtn') }}</span>
          <ExternalLink class="h-4 w-4" aria-hidden="true" />
        </a>
        <p v-else class="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
          <Info class="h-4 w-4 shrink-0 text-sky-600" aria-hidden="true" />
          <span>{{ t('news.relatedDocPending') }}</span>
        </p>
      </div>
    </article>
  </ModalDialog>
</template>
