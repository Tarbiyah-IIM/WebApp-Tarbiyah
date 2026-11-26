<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Search, ArrowRight, CalendarDays, Compass, Newspaper, HelpCircle, Users } from 'lucide-vue-next';
import ModalDialog from './ModalDialog.vue';
import { useLandingStore } from '../stores/landing.store.js';
import { useI18n } from '../composables/useI18n.js';
import { dynamicEn } from '../i18n/dynamicEn.js';
import { usePortalContent } from '../composables/usePortalContent.js';

const props = defineProps({
  open: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);

const router = useRouter();
const landingStore = useLandingStore();
const { t, tr, formatDate } = useI18n();
const { mergeProgramCard, mergeProgramDetail, mergeInfoPage } = usePortalContent();

function localizedText(rawText) {
  if (rawText === null || rawText === undefined) return '';
  const text = String(rawText);
  const english = dynamicEn[text.trim()];
  return english ? `${text} ${english}` : text;
}

function localizedList(list) {
  return Array.isArray(list) ? list.map(localizedText).join(' ') : localizedText(list);
}

function toSearchBlob(values) {
  return values.map(localizedText).filter(Boolean).join(' ').toLowerCase();
}

const query = ref('');
const inputRef = ref(null);

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;
    if (!landingStore.loaded) {
      landingStore.fetchLanding().catch(() => {});
    }
    await nextTick();
    inputRef.value?.focus();
  }
);

const normalizedQuery = computed(() => query.value.trim().toLowerCase());

function flattenSummaryBlocks(blocks) {
  if (!Array.isArray(blocks)) return '';
  return blocks
    .map((block) => {
      if (typeof block?.text === 'string') return block.text;
      if (Array.isArray(block?.segments)) {
        return block.segments.map((seg) => seg?.text || seg?.label || '').join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
}

const portalSearchIndex = computed(() => {
  const prodiPrograms = t('portalPages.programs') || {};
  const infoPages = t('portalPages.infoPages') || {};
  const courseCards = t('courses.cards') || [];
  const cardsById = Object.fromEntries(courseCards.map((card) => [card.id, card]));

  const prodiItems = [
    { slug: 'pai', to: '/program-studi/pai' },
    { slug: 'pgmi', to: '/program-studi/pgmi' },
    { slug: 'piaud', to: '/program-studi/piaud' }
  ].map(({ slug, to }) => {
    const baseCard = cardsById[slug] || {
      id: slug,
      badge: t('nav.programs'),
      title: slug.toUpperCase(),
      description: ''
    };
    const mergedCard = mergeProgramCard(baseCard);
    const mergedDetail = mergeProgramDetail(slug, prodiPrograms[slug] || {});
    const highlightsText = Array.isArray(mergedDetail?.highlights)
      ? mergedDetail.highlights.join(' ')
      : '';
    const careersText = Array.isArray(mergedDetail?.careers)
      ? mergedDetail.careers.join(' ')
      : '';
    return {
      key: `prodi-${slug}`,
      title: mergedCard.title || slug.toUpperCase(),
      subtitle: mergedCard.badge || mergedDetail?.degree || t('nav.programs'),
      keywords: toSearchBlob([
        mergedCard.title,
        mergedCard.badge,
        mergedCard.description,
        mergedDetail?.degree,
        mergedDetail?.studyMode,
        mergedDetail?.overview,
        highlightsText,
        careersText,
        slug
      ]),
      to
    };
  });

  const infoRoutes = [
    { key: 'administrasi-persuratan', to: '/akademik/administrasi-persuratan' },
    { key: 'ujian-komprehensif', to: '/akademik/ujian-komprehensif' },
    { key: 'ppl', to: '/publikasi/ppl' },
    { key: 'pkn', to: '/publikasi/pkn' },
    { key: 'jurnal', to: '/publikasi/jurnal' }
  ].map(({ key, to }) => {
    const mergedPage = mergeInfoPage(key, infoPages[key] || { title: key });
    const summaryText = [mergedPage?.summary, flattenSummaryBlocks(mergedPage?.summaryBlocks)]
      .filter(Boolean)
      .join(' ');
    const highlightsText = Array.isArray(mergedPage?.highlights)
      ? localizedList(mergedPage.highlights.map((h) => [h?.title, h?.desc].filter(Boolean).join(' ')))
      : '';
    const stepsText = Array.isArray(mergedPage?.steps) ? localizedList(mergedPage.steps) : '';
    return {
      key: `page-${key}`,
      title: mergedPage?.title || key,
      subtitle: mergedPage?.badge || '',
      keywords: toSearchBlob([mergedPage?.title, mergedPage?.badge, summaryText, highlightsText, stepsText, key]),
      to
    };
  });

  return [
    ...prodiItems,
    ...infoRoutes,
    {
      key: 'page-kuliah-tamu',
      title: t('guestLecture.title'),
      subtitle: t('guestLecture.heroHeading'),
      keywords: toSearchBlob([t('guestLecture.title'), t('guestLecture.heroHeading'), t('guestLecture.heroSubtitle')]),
      to: '/kuliah-tamu'
    }
  ];
});

const pageMatches = computed(() => {
  if (!normalizedQuery.value) return [];
  return portalSearchIndex.value
    .filter((entry) =>
      toSearchBlob([entry.title, entry.subtitle, entry.keywords]).includes(normalizedQuery.value)
    )
    .slice(0, 4);
});

function categoryNames(item) {
  const list = Array.isArray(item?.categories) ? item.categories : [];
  return [...list.map((cat) => cat?.name), ...(Array.isArray(item?.category_names) ? item.category_names : [])];
}

const newsMatches = computed(() => {
  const list = landingStore.data?.testimonials || [];
  if (!normalizedQuery.value) return [];
  return list
    .filter((n) =>
      toSearchBlob([
        n.name,
        n.category_name,
        ...categoryNames(n),
        n.job_title,
        n.quote,
        n.full_content
      ]).includes(normalizedQuery.value)
    )
    .slice(0, 4);
});

const agendaMatches = computed(() => {
  const list = landingStore.data?.agendas || [];
  if (!normalizedQuery.value) return [];
  return list
    .filter((a) =>
      toSearchBlob([
        a.title,
        a.event_date,
        formatDate(a.event_date),
        a.event_time,
        a.excerpt,
        a.description
      ]).includes(normalizedQuery.value)
    )
    .slice(0, 4);
});

const faqMatches = computed(() => {
  const list = landingStore.data?.faqs || [];
  if (!normalizedQuery.value) return [];
  return list
    .filter((f) => toSearchBlob([f.question, f.answer]).includes(normalizedQuery.value))
    .slice(0, 4);
});

const lecturerMatches = computed(() => {
  const list = landingStore.data?.lecturers || [];
  if (!normalizedQuery.value) return [];
  return list
    .filter((l) =>
      toSearchBlob([
        l.name,
        l.program_slug,
        l.leadership_role,
        l.academic_rank,
        l.rank_grade,
        l.education
      ]).includes(normalizedQuery.value)
    )
    .slice(0, 4);
});

const hasAnySectionMatch = computed(
  () =>
    pageMatches.value.length > 0 ||
    lecturerMatches.value.length > 0 ||
    newsMatches.value.length > 0 ||
    agendaMatches.value.length > 0 ||
    faqMatches.value.length > 0
);

function closeAndNavigate(target) {
  emit('close');
  query.value = '';
  router.push(target);
}

function openNewsResult(item) {
  closeAndNavigate({ path: '/', query: { newsId: String(item.id) }, hash: '#testimonials' });
}

function openAgendaResult(item) {
  closeAndNavigate({ path: '/', query: { agendaId: String(item.id) }, hash: '#agendas' });
}

function handleFormSubmit() {
  if (pageMatches.value.length > 0) {
    closeAndNavigate(pageMatches.value[0].to);
    return;
  }
  if (lecturerMatches.value.length > 0) {
    const first = lecturerMatches.value[0];
    closeAndNavigate(`/program-studi/${first.program_slug}/dosen/${first.id}`);
    return;
  }
  if (newsMatches.value.length > 0) {
    openNewsResult(newsMatches.value[0]);
    return;
  }
  if (agendaMatches.value.length > 0) {
    openAgendaResult(agendaMatches.value[0]);
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
        <div v-if="pageMatches.length > 0" class="space-y-2">
          <p class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Compass class="h-3.5 w-3.5 text-brand-600" />
            <span>{{ t('search.pagesSection') }}</span>
          </p>
          <div class="space-y-1.5">
            <button
              v-for="item in pageMatches"
              :key="item.key"
              type="button"
              class="flex w-full items-start justify-between gap-3 rounded-xl border border-surface-border bg-surface-page px-3.5 py-2.5 text-left transition hover:border-brand-300 hover:bg-brand-50"
              @click="closeAndNavigate(item.to)"
            >
              <div class="min-w-0">
                <p class="text-xs font-bold text-brand-900">{{ item.title }}</p>
                <p v-if="item.subtitle" class="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{{ item.subtitle }}</p>
              </div>
              <ArrowRight class="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            </button>
          </div>
        </div>

        <div v-if="lecturerMatches.length > 0" class="space-y-2">
          <p class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Users class="h-3.5 w-3.5 text-brand-600" />
            <span>{{ t('search.lecturersSection') }}</span>
          </p>
          <div class="space-y-1.5">
            <button
              v-for="item in lecturerMatches"
              :key="item.id"
              type="button"
              class="flex w-full items-start justify-between gap-3 rounded-xl border border-surface-border bg-surface-page px-3.5 py-2.5 text-left transition hover:border-brand-300 hover:bg-brand-50"
              @click="closeAndNavigate(`/program-studi/${item.program_slug}/dosen/${item.id}`)"
            >
              <div class="min-w-0">
                <p class="text-xs font-bold text-brand-900">{{ item.name }}</p>
                <p class="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
                  {{ [item.program_slug?.toUpperCase(), item.leadership_role, item.academic_rank].filter(Boolean).join(' · ') }}
                </p>
              </div>
              <ArrowRight class="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            </button>
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
              @click="openNewsResult(item)"
            >
              <div class="min-w-0">
                <p class="text-xs font-bold text-brand-900">{{ tr(item.name) }}</p>
                <p class="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{{ tr(item.quote) }}</p>
              </div>
              <ArrowRight class="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            </button>
          </div>
        </div>

        <div v-if="agendaMatches.length > 0" class="space-y-2">
          <p class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <CalendarDays class="h-3.5 w-3.5 text-emerald-600" />
            <span>{{ t('search.agendaSection') }}</span>
          </p>
          <div class="space-y-1.5">
            <button
              v-for="item in agendaMatches"
              :key="item.id"
              type="button"
              class="flex w-full items-start justify-between gap-3 rounded-xl border border-surface-border bg-surface-page px-3.5 py-2.5 text-left transition hover:border-brand-300 hover:bg-brand-50"
              @click="openAgendaResult(item)"
            >
              <div class="min-w-0">
                <p class="text-xs font-bold text-brand-900">{{ tr(item.title) }}</p>
                <p class="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{{ formatDate(item.event_date) }}</p>
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
