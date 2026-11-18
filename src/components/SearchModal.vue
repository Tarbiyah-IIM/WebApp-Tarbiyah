<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Search, ArrowRight, ExternalLink, BookOpen, Newspaper, HelpCircle, Compass } from 'lucide-vue-next';
import ModalDialog from './ModalDialog.vue';
import { useLandingStore } from '../stores/landing.store.js';
import { useI18n } from '../composables/useI18n.js';

const props = defineProps({
  open: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);

const router = useRouter();
const landingStore = useLandingStore();
const { t, tr } = useI18n();

const query = ref('');
const inputRef = ref(null);

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;
    if (!landingStore.loaded) {
      landingStore.fetchLanding();
    }
    await nextTick();
    inputRef.value?.focus();
  }
);

const normalizedQuery = computed(() => query.value.trim().toLowerCase());

const programMatches = computed(() => {
  const cards = t('courses.cards') || [];
  if (!normalizedQuery.value) return cards;
  return cards.filter((item) =>
    `${item.code} ${item.title} ${item.description}`.toLowerCase().includes(normalizedQuery.value)
  );
});

const serviceMatches = computed(() => {
  const list = landingStore.data?.partners || [];
  if (!normalizedQuery.value) return list;
  return list.filter((p) => `${p.name} ${tr(p.name)}`.toLowerCase().includes(normalizedQuery.value));
});

const newsMatches = computed(() => {
  const list = landingStore.data?.testimonials || [];
  if (!normalizedQuery.value) return [];
  return list
    .filter((n) => `${n.name} ${tr(n.name)} ${n.quote} ${tr(n.quote)}`.toLowerCase().includes(normalizedQuery.value))
    .slice(0, 4);
});

const faqMatches = computed(() => {
  const list = landingStore.data?.faqs || [];
  if (!normalizedQuery.value) return [];
  return list
    .filter((f) => `${f.question} ${tr(f.question)} ${f.answer} ${tr(f.answer)}`.toLowerCase().includes(normalizedQuery.value))
    .slice(0, 4);
});

const hasAnySectionMatch = computed(
  () =>
    programMatches.value.length > 0 ||
    serviceMatches.value.length > 0 ||
    newsMatches.value.length > 0 ||
    faqMatches.value.length > 0
);

function closeAndNavigate(target) {
  emit('close');
  query.value = '';
  router.push(target);
}

function submitCatalogSearch() {
  const trimmed = query.value.trim();
  closeAndNavigate(trimmed ? { path: '/courses', query: { q: trimmed } } : '/courses');
}

function splitServiceName(rawName) {
  const parts = String(rawName || '').split('|');
  return {
    title: tr((parts[0] || '').trim()),
    subtitle: tr(parts.slice(1).join('|').trim())
  };
}
</script>

<template>
  <ModalDialog :open="open" :title="t('search.modalTitle')" header-variant="macos" @close="emit('close')">
    <div class="space-y-5">
      <form class="relative flex items-center gap-2" @submit.prevent="submitCatalogSearch">
        <div class="relative flex-1">
          <Search class="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            ref="inputRef"
            v-model="query"
            type="search"
            data-testid="global-search-input"
            :aria-label="t('search.inputLabel')"
            :placeholder="t('search.placeholder')"
            class="min-h-[46px] w-full rounded-xl border border-surface-border bg-surface-page pl-10 pr-4 text-sm text-brand-900 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none"
          />
        </div>
        <button
          v-if="query"
          type="button"
          class="min-h-[46px] shrink-0 rounded-xl border border-surface-border px-3.5 text-xs font-semibold text-slate-600 hover:bg-surface-muted"
          @click="query = ''"
        >
          {{ t('search.clearBtn') }}
        </button>
      </form>

      <div class="max-h-[55vh] space-y-5 overflow-y-auto pr-1">
        <div v-if="programMatches.length > 0" class="space-y-2">
          <p class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <BookOpen class="h-3.5 w-3.5 text-brand-600" />
            <span>{{ t('search.programsSection') }}</span>
          </p>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <a
              v-for="prodi in programMatches"
              :key="prodi.id"
              :href="prodi.pmbUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flex flex-col justify-between rounded-xl border border-surface-border bg-surface-page p-3 transition hover:border-brand-300 hover:bg-brand-50"
            >
              <div>
                <span class="text-[11px] font-bold text-brand-700">{{ prodi.code }}</span>
                <p class="mt-0.5 text-xs font-bold text-brand-900">{{ prodi.title }}</p>
              </div>
              <span class="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600">
                <span>{{ t('courses.pmbBtn') }}</span>
                <ExternalLink class="h-3 w-3" />
              </span>
            </a>
          </div>
        </div>

        <div v-if="serviceMatches.length > 0" class="space-y-2">
          <p class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Compass class="h-3.5 w-3.5 text-brand-600" />
            <span>{{ t('search.servicesSection') }}</span>
          </p>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <template v-for="srv in serviceMatches" :key="srv.id">
              <a
                v-if="srv.url"
                :href="srv.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-between gap-2 rounded-xl border border-surface-border bg-surface-page px-3.5 py-2.5 text-left transition hover:border-brand-300 hover:bg-brand-50"
              >
                <div class="min-w-0">
                  <p class="truncate text-xs font-bold text-brand-900">{{ splitServiceName(srv.name).title }}</p>
                  <p v-if="splitServiceName(srv.name).subtitle" class="truncate text-[11px] text-slate-500">
                    {{ splitServiceName(srv.name).subtitle }}
                  </p>
                </div>
                <ExternalLink class="h-3.5 w-3.5 shrink-0 text-slate-400" />
              </a>
              <button
                v-else
                type="button"
                class="flex items-center justify-between gap-2 rounded-xl border border-surface-border bg-surface-page px-3.5 py-2.5 text-left transition hover:border-brand-300 hover:bg-brand-50"
                @click="closeAndNavigate('/#layanan-section')"
              >
                <div class="min-w-0">
                  <p class="truncate text-xs font-bold text-brand-900">{{ splitServiceName(srv.name).title }}</p>
                  <p v-if="splitServiceName(srv.name).subtitle" class="truncate text-[11px] text-slate-500">
                    {{ splitServiceName(srv.name).subtitle }}
                  </p>
                </div>
                <ArrowRight class="h-3.5 w-3.5 shrink-0 text-slate-400" />
              </button>
            </template>
          </div>
        </div>

        <div v-if="newsMatches.length > 0" class="space-y-2">
          <p class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Newspaper class="h-3.5 w-3.5 text-brand-600" />
            <span>{{ t('search.newsSection') }}</span>
          </p>
          <div class="space-y-1.5">
            <button
              v-for="item in newsMatches"
              :key="item.id"
              type="button"
              class="flex w-full items-start justify-between gap-3 rounded-xl border border-surface-border bg-surface-page px-3.5 py-2.5 text-left transition hover:border-brand-300 hover:bg-brand-50"
              @click="closeAndNavigate('/#testimonials')"
            >
              <div class="min-w-0">
                <p class="text-xs font-bold text-brand-900">{{ tr(item.name) }}</p>
                <p class="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{{ tr(item.quote) }}</p>
              </div>
              <ArrowRight class="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            </button>
          </div>
        </div>

        <div v-if="faqMatches.length > 0" class="space-y-2">
          <p class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <HelpCircle class="h-3.5 w-3.5 text-brand-600" />
            <span>{{ t('search.faqSection') }}</span>
          </p>
          <div class="space-y-1.5">
            <button
              v-for="faq in faqMatches"
              :key="faq.id"
              type="button"
              class="flex w-full items-start justify-between gap-3 rounded-xl border border-surface-border bg-surface-page px-3.5 py-2.5 text-left transition hover:border-brand-300 hover:bg-brand-50"
              @click="closeAndNavigate('/#faq')"
            >
              <div class="min-w-0">
                <p class="text-xs font-bold text-brand-900">{{ tr(faq.question) }}</p>
                <p class="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{{ tr(faq.answer) }}</p>
              </div>
              <ArrowRight class="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            </button>
          </div>
        </div>

        <div
          v-if="normalizedQuery && !hasAnySectionMatch"
          class="rounded-2xl border border-surface-border bg-surface-page p-5 text-center"
        >
          <p class="text-sm font-bold text-brand-900">{{ t('search.emptyTitle') }}</p>
          <p class="mt-1 text-xs text-slate-500">{{ t('search.emptyHint') }}</p>
        </div>
      </div>

      <div class="border-t border-surface-border pt-3">
        <button
          type="button"
          data-testid="search-catalog-submit"
          class="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-xs font-bold text-white transition hover:bg-brand-700"
          @click="submitCatalogSearch"
        >
          <Search class="h-4 w-4" />
          <span>
            {{
              query.trim()
                ? `${t('search.catalogCtaPrefix')}${query.trim()}${t('search.catalogCtaSuffix')}`
                : t('search.catalogAllBtn')
            }}
          </span>
        </button>
      </div>
    </div>
  </ModalDialog>
</template>
