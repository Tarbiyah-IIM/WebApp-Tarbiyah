<script setup>
import { ArrowRight, ExternalLink } from 'lucide-vue-next';
import { useToast } from '../composables/useToast.js';
import { useI18n } from '../composables/useI18n.js';

defineProps({
  partners: { type: Array, default: () => [] }
});

const toast = useToast();
const { t, tr } = useI18n();

function sanitizePartnerUrl(url) {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//') && !trimmed.includes('\\') ? trimmed : '';
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : '';
  } catch {
    return '';
  }
}

function isInternalRoute(url) {
  const safe = sanitizePartnerUrl(url);
  return safe.startsWith('/');
}

function externalHref(url) {
  const safe = sanitizePartnerUrl(url);
  return safe && !safe.startsWith('/') ? safe : '';
}

function splitServiceLabel(rawName) {
  const parts = String(rawName || '').split('|');
  const title = (parts[0] || '').trim();
  const subtitle = parts.slice(1).join('|').trim();
  return { title, subtitle };
}

function handlePendingService(partner) {
  const { title } = splitServiceLabel(partner.name);
  toast.info(t('services.pendingPrefix') + tr(title) + t('services.pendingSuffix'), t('services.badge'));
}
</script>

<template>
  <section id="layanan-section" class="border-y border-surface-border bg-white py-14">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <p class="text-center text-xs font-bold uppercase tracking-widest text-slate-500">
        {{ t('services.badge') }}
      </p>
      <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <template v-for="partner in partners" :key="partner.id">
          <router-link
            v-if="isInternalRoute(partner.url)"
            :to="sanitizePartnerUrl(partner.url)"
            class="group flex min-h-[84px] flex-col items-center justify-center gap-1 rounded-2xl border border-surface-border bg-surface-page px-4 py-3.5 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50"
          >
            <img
              v-if="sanitizePartnerUrl(partner.logo_url)"
              :src="sanitizePartnerUrl(partner.logo_url)"
              :alt="partner.name"
              loading="lazy"
              class="h-6 max-w-full object-contain"
            />
            <template v-else>
              <span class="inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-900 group-hover:text-brand-700">
                <span>{{ tr(splitServiceLabel(partner.name).title) }}</span>
                <ArrowRight class="h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
              </span>
              <span
                v-if="splitServiceLabel(partner.name).subtitle"
                class="text-xs font-medium leading-snug text-slate-500 group-hover:text-brand-700/80"
              >
                {{ tr(splitServiceLabel(partner.name).subtitle) }}
              </span>
            </template>
          </router-link>

          <a
            v-else-if="externalHref(partner.url)"
            :href="externalHref(partner.url)"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex min-h-[84px] flex-col items-center justify-center gap-1 rounded-2xl border border-surface-border bg-surface-page px-4 py-3.5 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50"
          >
            <img
              v-if="sanitizePartnerUrl(partner.logo_url)"
              :src="sanitizePartnerUrl(partner.logo_url)"
              :alt="partner.name"
              loading="lazy"
              class="h-6 max-w-full object-contain"
            />
            <template v-else>
              <span class="inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-900 group-hover:text-brand-700">
                <span>{{ tr(splitServiceLabel(partner.name).title) }}</span>
                <ExternalLink class="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-brand-600" />
              </span>
              <span
                v-if="splitServiceLabel(partner.name).subtitle"
                class="text-xs font-medium leading-snug text-slate-500 group-hover:text-brand-700/80"
              >
                {{ tr(splitServiceLabel(partner.name).subtitle) }}
              </span>
            </template>
          </a>

          <button
            v-else
            type="button"
            class="group flex min-h-[84px] flex-col items-center justify-center gap-1 rounded-2xl border border-surface-border bg-surface-page px-4 py-3.5 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50"
            @click="handlePendingService(partner)"
          >
            <img
              v-if="sanitizePartnerUrl(partner.logo_url)"
              :src="sanitizePartnerUrl(partner.logo_url)"
              :alt="partner.name"
              loading="lazy"
              class="h-6 max-w-full object-contain"
            />
            <template v-else>
              <span class="text-sm font-extrabold text-brand-900 group-hover:text-brand-700">
                {{ tr(splitServiceLabel(partner.name).title) }}
              </span>
              <span
                v-if="splitServiceLabel(partner.name).subtitle"
                class="text-xs font-medium leading-snug text-slate-500 group-hover:text-brand-700/80"
              >
                {{ tr(splitServiceLabel(partner.name).subtitle) }}
              </span>
            </template>
          </button>
        </template>
      </div>
    </div>
  </section>
</template>
