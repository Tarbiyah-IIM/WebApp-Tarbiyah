<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { GraduationCap, Mail, Phone, MapPin, ArrowRight } from 'lucide-vue-next';
import { publicService } from '../services/public.service.js';
import { extractApiError } from '../services/api.js';
import { useUiStore } from '../stores/ui.store.js';
import { useToast } from '../composables/useToast.js';

defineProps({
  settings: { type: Object, default: () => ({}) }
});

const router = useRouter();
const ui = useUiStore();
const toast = useToast();

const email = ref('');
const submitting = ref(false);

async function handleSubscribe() {
  if (!email.value.trim()) return;
  submitting.value = true;
  try {
    const res = await publicService.subscribe(email.value.trim(), 'footer');
    ui.setPrefillEmail(email.value.trim());
    toast.success(res.message);
    email.value = '';
  } catch (err) {
    toast.error(extractApiError(err));
  } finally {
    submitting.value = false;
  }
}

function goAuthWithEmail() {
  if (email.value.trim()) {
    ui.setPrefillEmail(email.value.trim());
  }
  router.push('/register');
}
</script>

<template>
  <footer id="footer-cta" class="bg-brand-900 text-slate-200">
    <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="rounded-3xl bg-gradient-to-r from-brand-700 to-brand-600 p-8 sm:p-12 shadow-float">
        <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div class="lg:col-span-6 space-y-2">
            <h2 class="text-2xl font-extrabold text-white sm:text-3xl">
              {{ settings.footer_cta_title || 'Start Your Learning Journey Today!' }}
            </h2>
            <p class="text-sm text-brand-100 sm:text-base">
              {{ settings.footer_cta_subtitle || 'Join 2 million+ learners building future-ready skills with Meekoo.' }}
            </p>
          </div>

          <form class="lg:col-span-6 flex flex-col gap-3 sm:flex-row" @submit.prevent="handleSubscribe">
            <label for="footer-email" class="sr-only">Email address</label>
            <input
              id="footer-email"
              v-model="email"
              type="email"
              required
              placeholder="Enter your email address"
              class="min-h-[48px] flex-1 rounded-xl border border-white/20 bg-white px-4 text-sm text-brand-900 placeholder:text-slate-400"
            />
            <button
              type="submit"
              :disabled="submitting"
              class="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 text-sm font-bold text-slate-900 hover:bg-amber-300 disabled:opacity-60 transition"
            >
              <span>{{ submitting ? 'Saving...' : 'Subscribe' }}</span>
              <ArrowRight class="h-4 w-4" />
            </button>
            <button
              type="button"
              class="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/20 transition"
              @click="goAuthWithEmail"
            >
              Login / Join
            </button>
          </form>
        </div>
      </div>

      <div class="mt-14 grid grid-cols-1 gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-4">
        <div class="space-y-4">
          <div class="flex items-center gap-2.5">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <GraduationCap class="h-6 w-6" />
            </div>
            <span class="text-xl font-extrabold text-white">Meekoo</span>
          </div>
          <p class="text-sm text-slate-400 leading-relaxed">
            Industry-led online courses, live mentor workshops, personalized roadmaps, and verified certificates.
          </p>
        </div>

        <div class="space-y-3">
          <h3 class="text-sm font-bold uppercase tracking-wider text-white">Explore</h3>
          <ul class="space-y-2 text-sm text-slate-400">
            <li><router-link to="/courses" class="hover:text-white transition">Courses</router-link></li>
            <li><router-link to="/checkout" class="hover:text-white transition">Shop & Premium</router-link></li>
            <li><router-link to="/verify-certificate" class="hover:text-white transition">Verify Certificate</router-link></li>
            <li><router-link to="/#faq" class="hover:text-white transition">FAQ</router-link></li>
          </ul>
        </div>

        <div class="space-y-3">
          <h3 class="text-sm font-bold uppercase tracking-wider text-white">Legal & Trust</h3>
          <ul class="space-y-2 text-sm text-slate-400">
            <li><router-link to="/terms" class="hover:text-white transition">Terms & Conditions</router-link></li>
            <li><router-link to="/privacy" class="hover:text-white transition">Privacy Policy</router-link></li>
            <li><router-link to="/login" class="hover:text-white transition">Student & Mentor Login</router-link></li>
          </ul>
        </div>

        <div class="space-y-3">
          <h3 class="text-sm font-bold uppercase tracking-wider text-white">Contact</h3>
          <ul class="space-y-2.5 text-sm text-slate-400">
            <li class="flex items-center gap-2">
              <Mail class="h-4 w-4 text-brand-400 shrink-0" />
              <span>{{ settings.contact_email || 'hello@meekoo.edu' }}</span>
            </li>
            <li class="flex items-center gap-2">
              <Phone class="h-4 w-4 text-brand-400 shrink-0" />
              <span>{{ settings.contact_phone || '+1 (415) 890-4321' }}</span>
            </li>
            <li class="flex items-start gap-2">
              <MapPin class="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
              <span>{{ settings.contact_address || '548 Market St, San Francisco, CA' }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p class="text-xs text-slate-400">
          © {{ new Date().getFullYear() }} Meekoo Online Learning Platform. All rights reserved.
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-300">VISA</span>
          <span class="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-300">Mastercard</span>
          <span class="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-300">Stripe Sandbox</span>
          <span class="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-300">PayPal</span>
        </div>
      </div>
    </div>
  </footer>
</template>
