<script setup>
import { ref, watch } from 'vue';
import { Clock, ExternalLink } from 'lucide-vue-next';
import ModalDialog from './ModalDialog.vue';
import { useI18n } from '../composables/useI18n.js';

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: null }
});

const emit = defineEmits(['close']);
const { t } = useI18n();
const iframeLoading = ref(true);

watch(
  () => [props.open, props.item?.modalUrl],
  ([isOpen, url]) => {
    if (isOpen && url) {
      iframeLoading.value = true;
    }
  }
);
</script>

<template>
  <ModalDialog :open="open" :title="item?.label || ''" header-variant="macos" @close="emit('close')">
    <div v-if="item?.modalUrl" class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-200 bg-brand-50/70 px-3.5 py-2.5 text-xs text-slate-600">
        <span>{{ t('portalPages.common.embedNotice') }}</span>
        <a
          :href="item.externalUrl || item.modalUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 font-bold text-white hover:bg-brand-700 transition"
        >
          <span>{{ t('portalPages.common.openInNewTabBtn') }}</span>
          <ExternalLink class="h-3.5 w-3.5" />
        </a>
      </div>

      <div class="relative overflow-hidden rounded-xl border border-surface-border bg-surface-page">
        <div
          v-if="iframeLoading"
          class="flex h-[58vh] min-h-[320px] items-center justify-center text-xs font-semibold text-slate-500"
        >
          {{ t('portalPages.common.loadingPreview') }}
        </div>
        <iframe
          :src="item.modalUrl"
          :title="item.label"
          class="w-full border-0 bg-white"
          :class="iframeLoading ? 'h-0 opacity-0' : 'h-[58vh] min-h-[320px] opacity-100'"
          loading="lazy"
          @load="iframeLoading = false"
        />
      </div>
    </div>

    <div v-else class="space-y-4 text-center py-4">
      <div class="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
        <Clock class="h-6 w-6" />
      </div>
      <div class="space-y-1.5">
        <span class="inline-block rounded-full bg-surface-muted px-3 py-1 text-xs font-bold text-slate-600">
          {{ item?.badge || 'Coming Soon' }}
        </span>
        <p class="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          {{ t('portalPages.common.comingSoonDesc') }}
        </p>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
        <a
          href="https://wa.link/qrwv15"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 transition"
        >
          <span>{{ t('portalPages.common.waAdminLabel') }}</span>
          <ExternalLink class="h-4 w-4" />
        </a>
      </div>
    </div>
  </ModalDialog>
</template>
