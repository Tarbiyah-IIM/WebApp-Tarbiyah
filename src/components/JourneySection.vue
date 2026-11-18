<script setup>
import { Award } from 'lucide-vue-next';
import lamdikLogo from '../assets/lamdik-logo.png';

defineProps({
  stats: { type: Array, default: () => [] }
});
</script>

<template>
  <section class="bg-brand-900 py-16 text-white sm:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        <div class="lg:col-span-5 space-y-5">
          <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Award class="h-4 w-4" />
            <span>Global Impact</span>
          </div>
          <h2 class="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Tarbiyah dalam Angka
          </h2>
          <p class="text-base text-slate-300 leading-relaxed">
            Terakreditasi Lembaga: Pengakuan mutu pendidikan nasional
          </p>

          <div class="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <img
              :src="lamdikLogo"
              alt="Logo LAMDIK"
              class="h-16 w-auto shrink-0 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]"
            />
            <div class="space-y-1 min-w-0">
              <span class="inline-block rounded-full bg-brand-100/15 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-200">
                NASIONAL
              </span>
              <h3 class="text-lg font-extrabold tracking-tight text-white">
                LAMDIK
              </h3>
              <p class="text-xs sm:text-sm text-slate-300">
                Lembaga Akreditasi Mandiri Kependidikan
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
          <div
            v-for="item in stats"
            :key="item.id"
            class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:bg-white/10"
          >
            <p class="text-3xl font-extrabold text-amber-400">
              {{ item.value_num }}{{ item.suffix || '' }}
            </p>
            <p class="mt-1 text-sm font-medium text-slate-200">{{ item.label }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
