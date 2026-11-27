<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Check, Copy, Link2, MessageCircle, Share2 } from 'lucide-vue-next';
import { useI18n } from '../composables/useI18n.js';
import { useToast } from '../composables/useToast.js';

const props = defineProps({
  url: { type: String, default: '' },
  title: { type: String, default: '' },
  label: { type: String, default: '' },
  testIdPrefix: { type: String, default: 'share' }
});

const { t } = useI18n();
const toast = useToast();
const copied = ref(false);
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
  }
);

onBeforeUnmount(clearCopiedTimer);

const canNativeShare = computed(
  () => typeof navigator !== 'undefined' && typeof navigator.share === 'function'
);

const displayLabel = computed(() => props.label || t('news.shareLinkLabel'));

const whatsappShareUrl = computed(() => {
  if (!props.url) return '';
  const text = props.title ? `${props.title}\n${props.url}` : props.url;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
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

async function triggerNativeShare() {
  if (!props.url || !canNativeShare.value) return;
  try {
    await navigator.share({
      title: props.title,
      text: props.title,
      url: props.url
    });
  } catch (err) {
    if (err?.name === 'AbortError') return;
    await copyShareLink();
  }
}
</script>

<template>
  <div
    v-if="url"
    :data-testid="`${testIdPrefix}-share-bar`"
    class="rounded-2xl border border-surface-border bg-surface-page p-4 space-y-3"
  >
    <div class="flex flex-col gap-1">
      <span class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
        <Link2 class="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
        <span>{{ displayLabel }}</span>
      </span>
      <a
        :href="url"
        class="break-all text-xs font-semibold text-brand-600 hover:underline"
      >{{ url }}</a>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        :data-testid="`${testIdPrefix}-copy-link-btn`"
        class="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-surface-border bg-white px-3.5 text-xs font-bold text-brand-900 transition hover:bg-brand-50"
        @click="copyShareLink"
      >
        <Check v-if="copied" class="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
        <Copy v-else class="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
        <span>{{ copied ? t('news.copiedLinkBtn') : t('news.copyLinkBtn') }}</span>
      </button>

      <a
        :href="whatsappShareUrl"
        target="_blank"
        rel="noopener noreferrer"
        :data-testid="`${testIdPrefix}-share-whatsapp`"
        class="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
      >
        <MessageCircle class="h-3.5 w-3.5" aria-hidden="true" />
        <span>{{ t('news.shareWhatsAppBtn') }}</span>
      </a>

      <button
        v-if="canNativeShare"
        type="button"
        :data-testid="`${testIdPrefix}-share-native-btn`"
        class="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 text-xs font-bold text-white transition hover:bg-brand-700"
        @click="triggerNativeShare"
      >
        <Share2 class="h-3.5 w-3.5" aria-hidden="true" />
        <span>{{ t('news.shareNativeBtn') }}</span>
      </button>
    </div>
  </div>
</template>
