<script setup>
import { ArrowRight, Sparkles, Crown, Award, CheckCircle2 } from 'lucide-vue-next';

defineProps({
  settings: { type: Object, default: () => ({}) }
});

defineEmits(['upgrade-premium']);
</script>

<template>
  <section class="relative overflow-hidden bg-gradient-to-b from-brand-50/80 via-white to-white py-14 sm:py-20">
    <div class="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
      <div class="lg:col-span-6 space-y-6">
        <div class="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-bold text-brand-700 shadow-sm">
          <Sparkles class="h-3.5 w-3.5 text-amber-500" />
          <span>{{ settings.hero_badge || '#1 Online Course 2025' }}</span>
        </div>

        <h1 class="text-4xl font-extrabold tracking-tight text-brand-900 sm:text-5xl lg:text-[54px] lg:leading-[1.12]">
          {{ settings.hero_title || 'Shape Your Future with the Right Knowledge' }}
        </h1>

        <p class="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          {{ settings.hero_subtitle || 'Learn directly from top industry practitioners across 90+ career categories with personalized learning paths, live sessions, and verified certificates.' }}
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

        <div class="flex flex-wrap items-center gap-5 pt-2 text-sm text-slate-600">
          <span class="inline-flex items-center gap-1.5">
            <CheckCircle2 class="h-4 w-4 text-emerald-600" />
            90+ Categories
          </span>
          <span class="inline-flex items-center gap-1.5">
            <CheckCircle2 class="h-4 w-4 text-emerald-600" />
            Live Mentor Sessions
          </span>
          <span class="inline-flex items-center gap-1.5">
            <CheckCircle2 class="h-4 w-4 text-emerald-600" />
            Verified Certificates
          </span>
        </div>
      </div>

      <div class="relative lg:col-span-6">
        <div class="relative mx-auto max-w-lg">
          <div class="overflow-hidden rounded-3xl border border-brand-100 bg-brand-100/40 p-3 shadow-float">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80"
              alt="Learners collaborating on Meekoo online courses"
              class="aspect-[4/3] w-full rounded-2xl object-cover"
            />
          </div>

          <div
            class="animate-float-slow absolute -top-5 -right-3 sm:-right-6 max-w-[230px] rounded-2xl border border-brand-100 bg-white p-4 shadow-float"
          >
            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-700">
              <Crown class="h-4 w-4 text-amber-500" />
              <span>{{ settings.premium_label || 'Premium Plan' }}</span>
            </div>
            <p class="mt-1 text-2xl font-extrabold text-brand-900">
              ${{ settings.premium_price || '160' }}
              <span class="text-xs font-medium text-slate-500">/ year</span>
            </p>
            <p class="mt-1 text-xs text-slate-600">Unlimited access to all courses & live webinars.</p>
            <button
              type="button"
              class="mt-3 inline-flex min-h-[38px] w-full items-center justify-center rounded-xl bg-brand-600 px-3 text-xs font-semibold text-white hover:bg-brand-700 transition"
              @click="$emit('upgrade-premium')"
            >
              Unlock All Access
            </button>
          </div>

          <div
            class="animate-float-delayed absolute -bottom-5 -left-2 sm:-left-6 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-float"
          >
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Award class="h-6 w-6" />
            </div>
            <div>
              <p class="text-sm font-bold text-brand-900">Best Collaboration</p>
              <p class="text-xs text-slate-600">300+ Verified Industry Mentors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
