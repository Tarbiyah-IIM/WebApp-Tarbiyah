<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Check, ChevronDown, ChevronUp, Link2, Share2, X } from 'lucide-vue-next';
import { useI18n } from '../composables/useI18n.js';
import { useToast } from '../composables/useToast.js';

const props = defineProps({
  url: { type: String, default: '' },
  title: { type: String, default: '' },
  testIdPrefix: { type: String, default: 'share' }
});

const { t } = useI18n();
const toast = useToast();
const containerRef = ref(null);
const copied = ref(false);
const menuOpen = ref(false);
let copiedTimer = null;

function clearCopiedTimer() {
  if (copiedTimer) {
    clearTimeout(copiedTimer);
    copiedTimer = null;
  }
}

watch(
  () => props.url,
  () => {
    clearCopiedTimer();
    copied.value = false;
    menuOpen.value = false;
  }
);

function handleDocumentClick(event) {
  if (menuOpen.value && containerRef.value && !containerRef.value.contains(event.target)) {
    menuOpen.value = false;
  }
}

function handleDocumentKeydown(event) {
  if (event.key === 'Escape' && menuOpen.value) {
    event.stopPropagation();
    menuOpen.value = false;
  }
}

onMounted(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleDocumentKeydown);
  }
});

onBeforeUnmount(() => {
  clearCopiedTimer();
  if (typeof document !== 'undefined') {
    document.removeEventListener('click', handleDocumentClick);
    document.removeEventListener('keydown', handleDocumentKeydown);
  }
});

const shareTargets = computed(() => {
  if (!props.url) return [];
  const encodedUrl = encodeURIComponent(props.url);
  const encodedTitle = encodeURIComponent(props.title || '');
  const combinedText = encodeURIComponent(props.title ? `${props.title}\n${props.url}` : props.url);

  return [
    {
      key: 'whatsapp',
      label: t('news.shareWhatsAppBtn'),
      href: `https://wa.me/?text=${combinedText}`,
      btnClass: 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'
    },
    {
      key: 'telegram',
      label: t('news.shareTelegramBtn'),
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      btnClass: 'border-sky-200 bg-white text-sky-700 hover:bg-sky-50'
    },
    {
      key: 'facebook',
      label: t('news.shareFacebookBtn'),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      btnClass: 'border-brand-200 bg-white text-brand-600 hover:bg-brand-50'
    },
    {
      key: 'x',
      label: t('news.shareXBtn'),
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      btnClass: 'border-surface-border bg-white text-brand-900 hover:bg-surface-muted'
    }
  ];
});

async function copyShareLink() {
  if (!props.url) return;
  try {
    await navigator.clipboard.writeText(props.url);
    copied.value = true;
    clearCopiedTimer();
    copiedTimer = setTimeout(() => {
      copied.value = false;
      copiedTimer = null;
    }, 2500);
    toast.success(t('news.shareCopiedToast'));
  } catch {
    toast.error(t('news.shareCopyError'));
  }
}
</script>

<template>
  <div
    v-if="url"
    ref="containerRef"
    :data-testid="`${testIdPrefix}-share-bar`"
    class="relative inline-flex flex-wrap items-center gap-2"
  >
    <button
      type="button"
      :data-testid="`${testIdPrefix}-copy-link-btn`"
      class="inline-flex min-h-[34px] items-center gap-1.5 rounded-xl border border-surface-border bg-surface-page px-3 text-xs font-semibold text-brand-900 transition hover:bg-brand-50"
      @click="copyShareLink"
    >
      <Check v-if="copied" class="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
      <Link2 v-else class="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
      <span>{{ copied ? t('news.copiedLinkBtn') : t('news.copyLinkBtn') }}</span>
    </button>

    <button
      type="button"
      :data-testid="`${testIdPrefix}-share-menu-btn`"
      aria-haspopup="menu"
      :aria-expanded="menuOpen"
      class="inline-flex min-h-[34px] items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 text-xs font-bold text-slate-900 shadow-xs transition hover:bg-amber-300"
      @click="menuOpen = !menuOpen"
    >
      <Share2 class="h-3.5 w-3.5" aria-hidden="true" />
      <span>{{ t('news.shareNativeBtn') }}</span>
      <ChevronUp v-if="menuOpen" class="h-3.5 w-3.5" aria-hidden="true" />
      <ChevronDown v-else class="h-3.5 w-3.5" aria-hidden="true" />
    </button>

    <div
      v-if="menuOpen"
      role="menu"
      :data-testid="`${testIdPrefix}-share-popover`"
      class="absolute left-0 top-full z-40 mt-2 w-72 rounded-2xl border border-surface-border bg-white p-4 shadow-float sm:left-auto sm:right-0"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {{ t('news.shareToHeading') }}
        </span>
        <button
          type="button"
          :aria-label="t('hero.closeBtn')"
          class="inline-flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition hover:bg-surface-muted hover:text-brand-900"
          @click="menuOpen = false"
        >
          <X class="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <div class="mt-2.5 grid grid-cols-2 gap-2">
        <a
          v-for="item in shareTargets"
          :key="item.key"
          :href="item.href"
          target="_blank"
          rel="noopener noreferrer"
          role="menuitem"
          :data-testid="`${testIdPrefix}-share-${item.key}`"
          class="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-xl border px-2.5 text-xs font-bold transition"
          :class="item.btnClass"
          @click="menuOpen = false"
        >
          <svg
            v-if="item.key === 'whatsapp'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <svg
            v-else-if="item.key === 'telegram'"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.66-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.03-.74 4.04-1.76 6.73-2.92 8.08-3.49 3.85-1.6 4.64-1.88 5.17-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.01.07.01.24 0 .38z" />
          </svg>
          <svg
            v-else-if="item.key === 'facebook'"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          >
            <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
          </svg>
          <span class="truncate">{{ item.label }}</span>
        </a>
      </div>
    </div>
  </div>
</template>
