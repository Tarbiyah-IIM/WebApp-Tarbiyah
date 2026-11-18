<script setup>
import { ArrowRight, CheckCircle2 } from 'lucide-vue-next';
import heroTarbiyahImage from '../assets/hero-tarbiyah.png';

defineProps({
  settings: { type: Object, default: () => ({}) }
});
</script>

<template>
  <section class="relative overflow-hidden bg-gradient-to-b from-brand-50/80 via-white to-white py-14 sm:py-20">
    <div class="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
      <div class="lg:col-span-6 space-y-6">
        <h1 class="text-4xl font-extrabold tracking-tight text-brand-900 sm:text-5xl lg:text-[52px] lg:leading-[1.12]">
          {{ settings.hero_title || 'Selamat Datang di Fakultas Tarbiyah' }}
        </h1>

        <p class="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          {{
            settings.hero_subtitle ||
            'Empowering the next generation of educators through academic excellence, innovative teaching, and strong Islamic values. We prepare future teachers and education leaders with the knowledge, skills, creativity, and global perspectives to inspire generations, transform education, and make a meaningful impact on society.'
          }}
        </p>

        <div class="flex flex-wrap items-center gap-4 pt-2">
          <router-link
            to="/register"
            class="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-brand-600 px-7 py-3 text-base font-semibold text-white shadow-float hover:bg-brand-700 transition"
          >
            Get Started
            <ArrowRight class="h-4 w-4" />
          </router-link>
          <router-link
            to="/courses"
            class="inline-flex min-h-[48px] items-center rounded-xl border border-surface-border bg-white px-6 py-3 text-base font-semibold text-brand-900 hover:bg-surface-muted transition"
          >
            Browse Courses
          </router-link>
        </div>

        <div class="flex flex-wrap items-center gap-3 pt-2 text-sm font-medium text-slate-600">
          <span class="inline-flex items-center gap-2">
            <CheckCircle2 class="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{{ settings.hero_tagline || 'Become Future Educators with Global Impact' }}</span>
          </span>
        </div>
      </div>

      <div class="relative lg:col-span-6">
        <div class="relative mx-auto max-w-lg">
          <div class="overflow-hidden rounded-3xl border border-brand-100 bg-brand-100/40 p-3 shadow-float">
            <img
              :src="heroTarbiyahImage"
              alt="Fakultas Tarbiyah"
              class="aspect-[4/3] w-full rounded-2xl object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
