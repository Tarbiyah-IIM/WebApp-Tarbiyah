<script setup>
import { computed, ref } from 'vue';
import { ArrowRight, CheckCircle2 } from 'lucide-vue-next';
import heroTarbiyahImage from '../assets/hero-tarbiyah.png';
import ModalDialog from './ModalDialog.vue';
import ScholarshipModal from './ScholarshipModal.vue';
import { useI18n } from '../composables/useI18n.js';

defineProps({
  settings: { type: Object, default: () => ({}) }
});

const { t, tr } = useI18n();
const profilModalOpen = ref(false);
const scholarshipModalOpen = ref(false);

const missionItems = computed(() => t('hero.missions'));
</script>

<template>
  <section class="relative overflow-hidden bg-gradient-to-b from-brand-50/80 via-white to-white pt-12 pb-0 sm:pt-16 lg:pt-12">
    <div class="mx-auto grid max-w-7xl grid-cols-1 items-end gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-6 lg:px-8">
      <div class="lg:col-span-6 pb-4 lg:pb-16 space-y-6">
        <h1 class="text-4xl font-extrabold tracking-tight text-brand-900 sm:text-5xl lg:text-[52px] lg:leading-[1.12]">
          {{ tr(settings.hero_title || 'Selamat Datang di Fakultas Tarbiyah') }}
        </h1>

        <p class="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          {{
            tr(
              settings.hero_subtitle ||
                'Empowering the next generation of educators through academic excellence, innovative teaching, and strong Islamic values. We prepare future teachers and education leaders with the knowledge, skills, creativity, and global perspectives to inspire generations, transform education, and make a meaningful impact on society.'
            )
          }}
        </p>

        <div class="flex flex-wrap items-center gap-4 pt-2">
          <button
            type="button"
            class="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-brand-600 px-7 py-3 text-base font-semibold text-white shadow-float hover:bg-brand-700 transition"
            @click="profilModalOpen = true"
          >
            {{ t('hero.profileBtn') }}
            <ArrowRight class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="inline-flex min-h-[48px] items-center rounded-xl border border-surface-border bg-white px-6 py-3 text-base font-semibold text-brand-900 hover:bg-surface-muted transition"
            @click="scholarshipModalOpen = true"
          >
            {{ t('hero.scholarshipBtn') }}
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-3 pt-2 text-sm font-medium text-slate-600">
          <span class="inline-flex items-center gap-2">
            <CheckCircle2 class="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{{ tr(settings.hero_tagline || 'Become Future Educators with Global Impact') }}</span>
          </span>
        </div>
      </div>

      <div class="lg:col-span-6 flex justify-center lg:justify-end self-end">
        <img
          :src="heroTarbiyahImage"
          :alt="t('hero.imageAlt')"
          class="w-full max-w-2xl h-auto max-h-[540px] object-contain object-bottom select-none"
        />
      </div>
    </div>

    <ModalDialog
      :open="profilModalOpen"
      :title="t('hero.modalTitle')"
      header-variant="macos"
      @close="profilModalOpen = false"
    >
      <div class="space-y-6">
        <div class="rounded-2xl border border-brand-100 bg-brand-50/70 p-5">
          <span class="inline-block rounded-full bg-brand-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            {{ t('hero.visionBadge') }}
          </span>
          <p class="mt-3 text-sm leading-relaxed text-brand-900 sm:text-base font-medium">
            {{ t('hero.visionText') }}
          </p>
        </div>

        <div class="rounded-2xl border border-surface-border bg-surface-page p-5">
          <span class="inline-block rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-900">
            {{ t('hero.missionBadge') }}
          </span>
          <ol class="mt-3 space-y-2.5 list-decimal pl-5 text-sm leading-relaxed text-slate-700 sm:text-base">
            <li v-for="item in missionItems" :key="item">
              {{ item }}
            </li>
          </ol>
        </div>
      </div>
    </ModalDialog>

    <ScholarshipModal :open="scholarshipModalOpen" @close="scholarshipModalOpen = false" />
  </section>
</template>
