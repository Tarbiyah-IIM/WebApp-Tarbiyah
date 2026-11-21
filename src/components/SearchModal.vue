<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Search, ArrowRight, Newspaper, HelpCircle } from 'lucide-vue-next';
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

const newsMatches = computed(() => {
  const list = landingStore.data?.testimonials || [];
  if (!normalizedQuery.value) return [];
  return list
    .filter((n) => `${n.name} ${tr(n.name)} ${n.category_name || ''} ${n.job_title || ''} ${n.quote} ${tr(n.quote)}`.toLowerCase().includes(normalizedQuery.value))
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
  () => newsMatches.value.length > 0 || faqMatches.value.length > 0
);

function closeAndNavigate(target) {
  emit('close');
  query.value = '';
  router.push(target);
}

function handleFormSubmit() {
  if (newsMatches.value.length > 0) {
    closeAndNavigate('/#testimonials');
    return;
  }
  if (faqMatches.value.length > 0) {
    closeAndNavigate('/#faq');
  }
}
</script>

<template>
  <ModalDialog :open="open" :title="t('search.modalTitle')" header-variant="macos" @close="emit('close')">
    <div class="space-y-5">
      <form class="relative flex items-center gap-2" @submit.prevent="handleFormSubmit">
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

      <div v-if="normalizedQuery" class="max-h-[55vh] space-y-5 overflow-y-auto pr-1">
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
          v-if="!hasAnySectionMatch"
          class="rounded-2xl border border-surface-border bg-surface-page p-5 text-center"
        >
          <p class="text-sm font-bold text-brand-900">{{ t('search.emptyTitle') }}</p>
          <p class="mt-1 text-xs text-slate-500">{{ t('search.emptyHint') }}</p>
        </div>
      </div>
    </div>
  </ModalDialog>
</template>
