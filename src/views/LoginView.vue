<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { LogIn } from 'lucide-vue-next';
import gedungIimBg from '../assets/gedung-iim.jpg';
import { useAuthStore } from '../stores/auth.store.js';
import { extractApiError } from '../services/api.js';
import { useToast } from '../composables/useToast.js';
import { useI18n } from '../composables/useI18n.js';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const toast = useToast();
const { t } = useI18n();

const email = ref('');
const password = ref('');
const submitting = ref(false);
const errorMessage = ref('');

async function handleLogin() {
  submitting.value = true;
  errorMessage.value = '';
  try {
    const user = await auth.login({ email: email.value, password: password.value });
    toast.success(t('auth.welcomePrefix') + user.name + '!');
    const redirect = route.query.redirect;
    if (redirect && typeof redirect === 'string') {
      router.push(redirect);
    } else if (user.role === 'admin') {
      router.push('/admin');
    } else if (user.role === 'mentor') {
      router.push('/mentor');
    } else {
      router.push('/dashboard');
    }
  } catch (err) {
    errorMessage.value = extractApiError(err);
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div
    class="relative flex min-h-[calc(100vh-73px)] items-center justify-center bg-cover bg-center px-4 py-12"
    :style="{ backgroundImage: 'url(' + gedungIimBg + ')' }"
  >
    <div class="absolute inset-0 bg-brand-900/55 backdrop-blur-[2px]"></div>

    <div class="relative z-10 w-full max-w-md rounded-3xl border border-white/30 bg-white/95 p-8 shadow-float backdrop-blur-md">
      <div class="text-center">
        <h1 class="text-2xl font-extrabold text-brand-900">{{ t('auth.loginHeading') }}</h1>
        <p class="mt-1 text-sm text-slate-600">{{ t('auth.loginSubtitle') }}</p>
      </div>

      <div v-if="errorMessage" role="alert" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="handleLogin">
        <div>
          <label for="login-email" class="block text-sm font-semibold text-brand-900">{{ t('auth.emailLabel') }}</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            :placeholder="t('auth.emailPlaceholder')"
            class="mt-1.5 min-h-[46px] w-full rounded-xl border border-surface-border bg-white px-4 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
          />
        </div>
        <div>
          <div class="flex items-center justify-between">
            <label for="login-password" class="block text-sm font-semibold text-brand-900">{{ t('auth.passcodeLabel') }}</label>
            <router-link to="/forgot-password" class="text-xs font-semibold text-brand-600 hover:underline">
              {{ t('auth.forgotLink') }}
            </router-link>
          </div>
          <input
            id="login-password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            :placeholder="t('auth.passcodePlaceholder')"
            class="mt-1.5 min-h-[46px] w-full rounded-xl border border-surface-border bg-white px-4 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60 transition"
        >
          <LogIn class="h-4 w-4" />
          <span>{{ submitting ? t('auth.signingIn') : t('auth.submitLogin') }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
