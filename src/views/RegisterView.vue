<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { UserPlus } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth.store.js';
import { useUiStore } from '../stores/ui.store.js';
import { extractApiError } from '../services/api.js';
import { useToast } from '../composables/useToast.js';

const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();
const toast = useToast();

const name = ref('');
const email = ref('');
const password = ref('');
const submitting = ref(false);
const errorMessage = ref('');

onMounted(() => {
  if (ui.prefillEmail) {
    email.value = ui.prefillEmail;
  }
});

async function handleRegister() {
  submitting.value = true;
  errorMessage.value = '';
  try {
    await auth.register({ name: name.value, email: email.value, password: password.value });
    toast.success('Account created! Welcome to Meekoo.');
    router.push('/dashboard');
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
      <h1 class="text-2xl font-extrabold text-brand-900">Create Your Meekoo Account</h1>
      <p class="mt-1 text-sm text-slate-600">Start learning with curated courses, personalized paths, and certificates.</p>

      <div v-if="errorMessage" role="alert" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="handleRegister">
        <div>
          <label for="reg-name" class="block text-sm font-semibold text-brand-900">Full Name</label>
          <input
            id="reg-name"
            v-model="name"
            type="text"
            required
            minlength="2"
            class="mt-1.5 min-h-[46px] w-full rounded-xl border border-surface-border px-4 text-sm"
          />
        </div>
        <div>
          <label for="reg-email" class="block text-sm font-semibold text-brand-900">Email</label>
          <input
            id="reg-email"
            v-model="email"
            type="email"
            required
            class="mt-1.5 min-h-[46px] w-full rounded-xl border border-surface-border px-4 text-sm"
          />
        </div>
        <div>
          <label for="reg-password" class="block text-sm font-semibold text-brand-900">Password (min 6 chars)</label>
          <input
            id="reg-password"
            v-model="password"
            type="password"
            required
            minlength="6"
            class="mt-1.5 min-h-[46px] w-full rounded-xl border border-surface-border px-4 text-sm"
          />
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60 transition"
        >
          <UserPlus class="h-4 w-4" />
          <span>{{ submitting ? 'Creating account...' : 'Get Started' }}</span>
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-slate-600">
        Already have an account?
        <router-link to="/login" class="font-bold text-brand-600 hover:underline">Login</router-link>
      </p>
    </div>
  </div>
</template>
