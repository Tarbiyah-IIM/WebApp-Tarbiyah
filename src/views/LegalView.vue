<script setup>
import { useI18n } from '../composables/useI18n.js';

const { t } = useI18n();
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="rounded-3xl border border-surface-border bg-white p-8 shadow-card space-y-6">
      <h1 class="text-3xl font-extrabold text-brand-900">
        {{ t('legal.privacyTitle') }}
      </h1>
      <p class="text-sm text-slate-600 leading-relaxed">
        {{ t('legal.privacyBody') }}
      </p>
      <router-link
        to="/"
        class="inline-flex min-h-[44px] items-center rounded-xl bg-brand-600 px-5 text-sm font-bold text-white"
      >
        {{ t('legal.backHomeBtn') }}
      </router-link>
    </div>
  </div>
</template>
