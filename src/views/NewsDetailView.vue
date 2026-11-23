<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft, Calendar, ExternalLink, Info } from 'lucide-vue-next';
import gedungIimFallback from '../assets/gedung-iim.jpg';
import NewsGallerySlideshow from '../components/NewsGallerySlideshow.vue';
import PortalPageShell from '../components/PortalPageShell.vue';
import StateFeedback from '../components/StateFeedback.vue';
import { useAsyncState } from '../composables/useAsyncState.js';
import { useI18n } from '../composables/useI18n.js';
import { publicService } from '../services/public.service.js';
import { useLandingStore } from '../stores/landing.store.js';

const route = useRoute();
const landingStore = useLandingStore();
const { t, tr } = useI18n();
const { loading, error, isOffline, run } = useAsyncState();

const article = ref(null);
const notFound = ref(false);

const gallery = computed(() => (Array.isArray(article.value?.gallery_urls) ? article.value.gallery_urls : []));
const slideshowPos = computed(() => article.value?.slideshow_position || 'bottom');
const showSlideshow = computed(() => gallery.value.length > 0 && slideshowPos.value !== 'none');

const categories = computed(() => {
  if (!article.value) return [];
  if (Array.isArray(article.value.categories) && article.value.categories.length > 0) {
    return article.value.categories;
  }
  if (article.value.category_name) {
    return [{ id: article.value.category_id || 0, name: article.value.category_name }];
  }
  return [];
});

const contentParagraphs = computed(() => {
  if (!article.value) return [];
  const raw = tr(article.value.full_content || article.value.quote || '');
  return String(raw)
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
});

const otherNewsLinks = computed(() => {
  const list = landingStore.data?.testimonials || [];
  const currentId = Number(route.params.id);
  return list
    .filter((item) => Number(item.id) !== currentId)
    .slice(0, 5)
    .map((item) => ({
      to: `/berita/${item.id}`,
      label: tr(item.name)
    }));
});

async function loadArticle() {
  notFound.value = false;
  try {
    await run(async () => {
      const res = await publicService.getNewsById(route.params.id);
      article.value = res.news;
    });
  } catch (err) {
    if (err?.response?.status === 404) {
      article.value = null;
      notFound.value = true;
    }
  }
}

watch(
  () => route.params.id,
  () => {
    loadArticle();
  },
  { immediate: true }
);
</script>

<template>
  <PortalPageShell
    :category="t('news.heading')"
    :title="article ? tr(article.name) : t('portalPages.common.notFoundTitle')"
    :missing="notFound"
    :other-title="t('news.otherNewsHeading')"
    :other-links="otherNewsLinks"
  >
    <StateFeedback
      v-if="!article && (loading || error)"
      :loading="loading"
      :error="error"
      :offline="isOffline"
      @retry="loadArticle"
    />

    <article v-else-if="article" class="space-y-6">
      <header class="rounded-3xl border border-surface-border bg-white p-6 sm:p-8 shadow-card space-y-4">
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
            <span>{{ tr(article.job_title) }}</span>
          </span>
        </div>

        <h1 class="text-2xl font-extrabold tracking-tight text-brand-900 sm:text-3xl">
          {{ tr(article.name) }}
        </h1>

        <p class="text-sm leading-relaxed text-slate-600 sm:text-base">
          {{ tr(article.quote) }}
        </p>

        <div class="overflow-hidden rounded-2xl border border-surface-border bg-slate-100">
          <img
            :src="article.avatar_url || gedungIimFallback"
            :alt="tr(article.name)"
            class="aspect-[16/9] w-full object-cover"
          />
        </div>
      </header>

      <NewsGallerySlideshow
        v-if="showSlideshow && slideshowPos === 'top'"
        :images="gallery"
        :title="tr(article.name)"
        :heading="t('news.galleryHeading')"
      />

      <section class="rounded-2xl border border-surface-border bg-white p-6 sm:p-8 shadow-card space-y-4">
        <p
          v-for="(paragraph, idx) in contentParagraphs"
          :key="idx"
          class="whitespace-pre-line text-sm leading-relaxed text-slate-700 sm:text-base"
        >
          {{ paragraph }}
        </p>

        <div v-if="article.related_url" class="border-t border-surface-border pt-4">
          <a
            v-if="article.related_url !== '#'"
            :href="article.related_url"
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
      </section>

      <NewsGallerySlideshow
        v-if="showSlideshow && slideshowPos === 'bottom'"
        :images="gallery"
        :title="tr(article.name)"
        :heading="t('news.galleryHeading')"
      />
    </article>

    <template #sidebar-top>
      <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card">
        <router-link
          to="/#testimonials"
          class="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-page px-4 text-sm font-semibold text-brand-900 transition hover:bg-brand-50"
        >
          <ArrowLeft class="h-4 w-4" aria-hidden="true" />
          <span>{{ t('news.backToNews') }}</span>
        </router-link>
      </section>
    </template>
  </PortalPageShell>
</template>
