<script setup>
import { computed, ref, watch } from 'vue';
import { Check, Copy } from 'lucide-vue-next';
import ModalDialog from '../ModalDialog.vue';
import { useI18n } from '../../composables/useI18n.js';
import { useToast } from '../../composables/useToast.js';
import { tokenizeLinkSegments } from '../../services/linkify.service.js';

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: null }
});

const emit = defineEmits(['close']);
const { t } = useI18n();
const toast = useToast();
const copied = ref(false);

const inviteText = computed(() => String(props.item?.linkZoom || '').trim());
const linkSegments = computed(() => tokenizeLinkSegments(inviteText.value));

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) copied.value = false;
  }
);

async function copyInvite() {
  if (!inviteText.value) return;
  try {
    await navigator.clipboard.writeText(inviteText.value);
    copied.value = true;
    toast.success(t('guestLecture.zoomCopiedToast'));
  } catch {
    toast.error(t('guestLecture.zoomCopyError'));
  }
}
</script>

<template>
  <ModalDialog
    :open="open"
    :title="t('guestLecture.zoomModalTitle')"
    header-variant="macos"
    @close="emit('close')"
  >
    <div class="space-y-4">
      <div
        v-if="item?.mataKuliah"
        class="rounded-xl border border-surface-border bg-surface-page px-3.5 py-2.5 text-xs"
      >
        <p class="font-bold text-brand-900">{{ item.mataKuliah }}</p>
        <p v-if="item.dosenTamu" class="mt-0.5 text-slate-500">{{ item.dosenTamu }}</p>
      </div>

      <div class="max-h-72 overflow-y-auto whitespace-pre-line rounded-xl border border-surface-border bg-surface-page p-4 text-xs leading-relaxed text-slate-700 sm:text-sm">
        <template v-for="(seg, idx) in linkSegments" :key="idx">
          <a
            v-if="seg.type === 'link'"
            :href="seg.href"
            target="_blank"
            rel="noopener noreferrer"
            class="break-all font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-700"
          >{{ seg.text }}</a>
          <template v-else>{{ seg.text }}</template>
        </template>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-2.5 border-t border-surface-border pt-3">
        <button
          type="button"
          class="min-h-[40px] rounded-xl border border-surface-border bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-surface-muted"
          @click="emit('close')"
        >
          {{ t('guestLecture.cancelBtn') }}
        </button>
        <button
          type="button"
          class="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-xs font-bold text-white transition hover:bg-brand-700"
          @click="copyInvite"
        >
          <Check v-if="copied" class="h-4 w-4" aria-hidden="true" />
          <Copy v-else class="h-4 w-4" aria-hidden="true" />
          <span>{{ copied ? t('guestLecture.zoomCopiedBtn') : t('guestLecture.zoomCopyBtn') }}</span>
        </button>
      </div>
    </div>
  </ModalDialog>
</template>
