<script setup>
import { onMounted, ref } from 'vue';
import { ShieldCheck } from 'lucide-vue-next';
import { useI18n } from '../composables/useI18n.js';

const { t } = useI18n();
const visible = ref(false);

onMounted(() => {
  if (!localStorage.getItem('meekoo_cookie_consent')) {
    visible.value = true;
  }
});

function accept(choice) {
  localStorage.setItem('meekoo_cookie_consent', choice);
  visible.value = false;
}
</script>

<template>
  <div
    v-if="visible"
    role="region"
    :aria-label="t('cookie.ariaLabel')"
    class="fixed bottom-24 left-4 right-4 z-40 mx-auto max-w-4xl rounded-2xl border border-surface-border bg-white p-4 shadow-float sm:flex sm:items-center sm:justify-between sm:gap-6 lg:bottom-4"
  >
    <div class="flex items-start gap-3">
      <ShieldCheck class="h-5 w-5 shrink-0 text-brand-600 mt-0.5" />
      <p class="text-xs sm:text-sm text-slate-600">
        {{ t('cookie.prefix') }}
        <router-link to="/privacy" class="font-semibold text-brand-700 underline">{{ t('cookie.policyLink') }}</router-link>.
      </p>
    </div>
    <div class="mt-3 flex shrink-0 items-center gap-2 sm:mt-0">
      <button
        type="button"
        class="min-h-[40px] rounded-xl border border-surface-border px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        @click="accept('essential')"
      >
        {{ t('cookie.essentialBtn') }}
      </button>
      <button
        type="button"
        class="min-h-[40px] rounded-xl bg-brand-600 px-4 text-xs font-semibold text-white hover:bg-brand-700"
        @click="accept('all')"
      >
        {{ t('cookie.acceptBtn') }}
      </button>
    </div>
  </div>
</template>
