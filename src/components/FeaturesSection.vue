<script setup>
import { CheckCircle2 } from 'lucide-vue-next';
import howTarbiyahImage from '../assets/how-tarbiyah.png';

defineProps({
  features: { type: Array, default: () => [] }
});
</script>

<template>
  <section id="features" class="bg-white pt-16 pb-0 sm:pt-20">
    <div class="mx-auto grid max-w-7xl grid-cols-1 items-end gap-6 px-4 sm:px-6 lg:grid-cols-12 lg:gap-4 lg:px-8">
      <div class="flex justify-center lg:justify-end self-end lg:col-span-5 lg:pr-4 order-2 lg:order-1">
        <img
          :src="howTarbiyahImage"
          alt="Mahasiswi Fakultas Tarbiyah"
          loading="lazy"
          class="block h-auto max-h-[660px] w-auto max-w-full object-contain object-bottom select-none"
        />
      </div>

      <div class="lg:col-span-7 pb-10 sm:pb-14 lg:pb-20 space-y-6 order-1 lg:order-2">
        <span class="inline-block rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
          Alasan Kuliah
        </span>
        <h2 class="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
          Kenapa Harus Kuliah di Fakultas Tarbiyah?
        </h2>
        <p class="text-base text-slate-600">
          Belajar dalam lingkungan kampus yang mendukung pengembangan intelektual, spiritual, karakter, dan kreativitas mahasiswa.
        </p>

        <ul class="space-y-4">
          <li
            v-for="item in features"
            :key="item.id"
            class="flex items-start gap-3.5 rounded-2xl border border-surface-border bg-surface-page p-4"
          >
            <CheckCircle2 class="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <h3 class="text-base font-bold text-brand-900">{{ item.title }}</h3>
              <p class="mt-1 text-sm text-slate-600">{{ item.description }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
