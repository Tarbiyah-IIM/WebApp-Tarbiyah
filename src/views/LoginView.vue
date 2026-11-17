<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { LogIn } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth.store.js';
import { extractApiError } from '../services/api.js';
import { useToast } from '../composables/useToast.js';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const toast = useToast();

const email = ref('');
const password = ref('');
const submitting = ref(false);
const errorMessage = ref('');

function fillDemo(demoEmail) {
  email.value = demoEmail;
  password.value = 'Meekoo123!';
}

async function handleLogin() {
  submitting.value = true;
  errorMessage.value = '';
  try {
    const user = await auth.login({ email: email.value, password: password.value });
    toast.success(`Welcome back, ${user.name}!`);
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
  <div class="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-12">
    <div class="w-full rounded-3xl border border-surface-border bg-white p-8 shadow-float">
      <h1 class="text-2xl font-extrabold text-brand-900">Sign in to Meekoo</h1>
      <p class="mt-1 text-sm text-slate-600">Access your synchronized courses, live sessions, or management panel.</p>

      <div v-if="errorMessage" role="alert" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="handleLogin">
        <div>
          <label for="login-email" class="block text-sm font-semibold text-brand-900">Email</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="mt-1.5 min-h-[46px] w-full rounded-xl border border-surface-border px-4 text-sm"
          />
        </div>
        <div>
          <div class="flex items-center justify-between">
            <label for="login-password" class="block text-sm font-semibold text-brand-900">Password</label>
            <router-link to="/forgot-password" class="text-xs font-semibold text-brand-600 hover:underline">
              Forgot password?
            </router-link>
          </div>
          <input
            id="login-password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="mt-1.5 min-h-[46px] w-full rounded-xl border border-surface-border px-4 text-sm"
          />
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60 transition"
        >
          <LogIn class="h-4 w-4" />
          <span>{{ submitting ? 'Signing in...' : 'Login' }}</span>
        </button>
      </form>

      <div class="mt-6 rounded-2xl border border-surface-border bg-surface-page p-4">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Sandbox Demo Accounts</p>
        <div class="grid grid-cols-3 gap-2">
          <button
            type="button"
            class="rounded-lg border border-surface-border bg-white py-2 text-xs font-semibold text-brand-900 hover:bg-brand-50"
            @click="fillDemo('student@meekoo.test')"
          >
            Student
          </button>
          <button
            type="button"
            class="rounded-lg border border-surface-border bg-white py-2 text-xs font-semibold text-brand-900 hover:bg-brand-50"
            @click="fillDemo('sarah@meekoo.test')"
          >
            Mentor
          </button>
          <button
            type="button"
            class="rounded-lg border border-surface-border bg-white py-2 text-xs font-semibold text-brand-900 hover:bg-brand-50"
            @click="fillDemo('admin@meekoo.test')"
          >
            Admin
          </button>
        </div>
      </div>

      <p class="mt-6 text-center text-sm text-slate-600">
        New to Meekoo?
        <router-link to="/register" class="font-bold text-brand-600 hover:underline">Create an account</router-link>
      </p>
    </div>
  </div>
</template>
