<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { Check, ChevronDown, Globe } from 'lucide-vue-next';
import { useI18n } from '../composables/useI18n.js';

defineProps({
  compact: { type: Boolean, default: false }
});

const { locale, setLocale, t } = useI18n();
const open = ref(false);
const containerRef = ref(null);

const options = [
  { code: 'id', labelKey: 'lang.idLabel' },
  { code: 'en', labelKey: 'lang.enLabel' }
];

function choose(code) {
  setLocale(code);
  open.value = false;
}

function handleDocumentClick(event) {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    open.value = false;
  }
}

function handleDocumentKeydown(event) {
  if (event.key === 'Escape') {
    open.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleDocumentKeydown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
  document.removeEventListener('keydown', handleDocumentKeydown);
});
</script>

<template>
  <div ref="containerRef" class="relative">
    <button
      type="button"
      data-testid="lang-dropdown-toggle"
      aria-haspopup="menu"
      :aria-expanded="open"
      :aria-label="t('lang.switchLabel')"
      :title="t('lang.switchLabel')"
      class="inline-flex items-center gap-1.5 rounded-xl border border-surface-border bg-white px-2.5 text-xs font-bold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
      :class="compact ? 'min-h-[38px]' : 'min-h-[40px]'"
      @click="open = !open"
    >
      <Globe class="h-4 w-4 text-brand-600" aria-hidden="true" />
      <span>{{ locale.toUpperCase() }}</span>
      <ChevronDown
        class="h-3.5 w-3.5 text-slate-400 transition-transform duration-150"
        :class="{ 'rotate-180': open }"
        aria-hidden="true"
      />
    </button>

    <div
      v-if="open"
      role="menu"
      :aria-label="t('lang.switchLabel')"
      class="absolute right-0 top-full z-50 mt-2 w-44 rounded-2xl border border-surface-border bg-white p-1.5 shadow-float"
    >
      <button
        v-for="opt in options"
        :key="opt.code"
        type="button"
        role="menuitemradio"
        :aria-checked="locale === opt.code"
        :data-testid="`lang-switch-${opt.code}`"
        class="flex min-h-[38px] w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold transition"
        :class="
          locale === opt.code
            ? 'bg-brand-50 text-brand-700 font-bold'
            : 'text-slate-700 hover:bg-surface-page hover:text-brand-900'
        "
        @click="choose(opt.code)"
      >
        <span class="flex items-center gap-2">
          <span
            class="inline-flex h-5 w-6 items-center justify-center rounded-md text-[10px] font-extrabold"
            :class="locale === opt.code ? 'bg-brand-600 text-white' : 'bg-surface-muted text-slate-600'"
          >
            {{ opt.code.toUpperCase() }}
          </span>
          <span>{{ t(opt.labelKey) }}</span>
        </span>
        <Check v-if="locale === opt.code" class="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
