<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { KeyRound } from 'lucide-vue-next';
import { authService } from '../services/auth.service.js';
import { extractApiError } from '../services/api.js';
import { useToast } from '../composables/useToast.js';

const router = useRouter();
const toast = useToast();

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
  <div class="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-12">
    <div class="w-full rounded-3xl border border-surface-border bg-white p-8 shadow-float">
      <div class="flex items-center gap-2 text-brand-700 mb-2">
        <KeyRound class="h-5 w-5" />
        <span class="text-xs font-bold uppercase tracking-wider">Account Recovery</span>
      </div>
      <h1 class="text-2xl font-extrabold text-brand-900">
        {{ step === 'request' ? 'Forgot Password' : 'Set New Password' }}
      </h1>

      <div v-if="errorMessage" role="alert" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <form v-if="step === 'request'" class="mt-6 space-y-4" @submit.prevent="requestReset">
        <div>
          <label for="fp-email" class="block text-sm font-semibold text-brand-900">Registered Email</label>
          <input
            id="fp-email"
            v-model="email"
            type="email"
            required
            class="mt-1.5 min-h-[46px] w-full rounded-xl border border-surface-border px-4 text-sm"
          />
        </div>
        <button
          type="submit"
          :disabled="submitting"
          class="min-h-[48px] w-full rounded-xl bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {{ submitting ? 'Sending...' : 'Request Reset Token' }}
        </button>
      </form>

      <form v-else class="mt-6 space-y-4" @submit.prevent="confirmReset">
        <div v-if="sandboxTokenInfo" class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          Sandbox reset token generated and pre-filled below.
        </div>
        <div>
          <label for="rp-token" class="block text-sm font-semibold text-brand-900">Reset Token</label>
          <input
            id="rp-token"
            v-model="resetToken"
            type="text"
            required
            class="mt-1.5 min-h-[46px] w-full rounded-xl border border-surface-border px-4 text-sm"
          />
        </div>
        <div>
          <label for="rp-pass" class="block text-sm font-semibold text-brand-900">New Password</label>
          <input
            id="rp-pass"
            v-model="newPassword"
            type="password"
            required
            minlength="6"
            class="mt-1.5 min-h-[46px] w-full rounded-xl border border-surface-border px-4 text-sm"
          />
        </div>
        <button
          type="submit"
          :disabled="submitting"
          class="min-h-[48px] w-full rounded-xl bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {{ submitting ? 'Updating...' : 'Update Password' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-slate-600">
        <router-link to="/login" class="font-bold text-brand-600 hover:underline">Back to Login</router-link>
      </p>
    </div>
  </div>
</template>
