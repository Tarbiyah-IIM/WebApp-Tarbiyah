<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { KeyRound } from 'lucide-vue-next';
import gedungIimBg from '../assets/gedung-iim.webp';
import { authService } from '../services/auth.service.js';
import { extractApiError } from '../services/api.js';
import { useToast } from '../composables/useToast.js';
import { useI18n } from '../composables/useI18n.js';

const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const step = ref('request');
const email = ref('');
const resetToken = ref('');
const newPassword = ref('');
const sandboxTokenInfo = ref('');
const submitting = ref(false);
const errorMessage = ref('');

async function requestReset() {
  submitting.value = true;
  errorMessage.value = '';
  try {
    const res = await authService.forgotPassword(email.value);
    toast.success(res.message);
    if (res.sandboxResetToken) {
      sandboxTokenInfo.value = res.sandboxResetToken;
      resetToken.value = res.sandboxResetToken;
    }
    step.value = 'reset';
  } catch (err) {
    errorMessage.value = extractApiError(err);
  } finally {
    submitting.value = false;
  }
}

async function confirmReset() {
  submitting.value = true;
  errorMessage.value = '';
  try {
    const res = await authService.resetPassword({
      token: resetToken.value,
      newPassword: newPassword.value
    });
    toast.success(res.message);
    router.push('/login');
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
      <div class="flex items-center gap-2 text-brand-700 mb-2">
        <KeyRound class="h-5 w-5" />
        <span class="text-xs font-bold uppercase tracking-wider">{{ t('auth.recoveryBadge') }}</span>
      </div>
      <h1 class="text-2xl font-extrabold text-brand-900">
        {{ step === 'request' ? t('auth.forgotHeading') : t('auth.setNewHeading') }}
      </h1>

      <div v-if="errorMessage" role="alert" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <form v-if="step === 'request'" class="mt-6 space-y-4" @submit.prevent="requestReset">
        <div>
          <label for="fp-email" class="block text-sm font-semibold text-brand-900">{{ t('auth.recoveryEmailLabel') }}</label>
          <input
            id="fp-email"
            v-model="email"
            type="email"
            required
            :placeholder="t('auth.recoveryEmailPlaceholder')"
            class="mt-1.5 min-h-[46px] w-full rounded-xl border border-surface-border bg-white px-4 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          :disabled="submitting"
          class="min-h-[48px] w-full rounded-xl bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60 transition"
        >
          {{ submitting ? t('auth.sendingToken') : t('auth.sendTokenBtn') }}
        </button>
      </form>

      <form v-else class="mt-6 space-y-4" @submit.prevent="confirmReset">
        <div v-if="sandboxTokenInfo" class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          {{ t('auth.sandboxNote') }}
        </div>
        <div>
          <label for="rp-token" class="block text-sm font-semibold text-brand-900">{{ t('auth.resetTokenLabel') }}</label>
          <input
            id="rp-token"
            v-model="resetToken"
            type="text"
            required
            class="mt-1.5 min-h-[46px] w-full rounded-xl border border-surface-border bg-white px-4 text-sm text-brand-900"
          />
        </div>
        <div>
          <label for="rp-pass" class="block text-sm font-semibold text-brand-900">{{ t('auth.newPasswordLabel') }}</label>
          <input
            id="rp-pass"
            v-model="newPassword"
            type="password"
            required
            minlength="8"
            maxlength="72"
            class="mt-1.5 min-h-[46px] w-full rounded-xl border border-surface-border bg-white px-4 text-sm text-brand-900"
          />
        </div>
        <button
          type="submit"
          :disabled="submitting"
          class="min-h-[48px] w-full rounded-xl bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60 transition"
        >
          {{ submitting ? t('auth.updatingPasscode') : t('auth.resetPasswordBtn') }}
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-slate-600">
        <router-link to="/login" class="font-semibold text-brand-600 hover:underline">{{ t('auth.backToLogin') }}</router-link>
      </p>
    </div>
  </div>
</template>
