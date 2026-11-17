<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Award, Search, CheckCircle2 } from 'lucide-vue-next';
import { publicService } from '../services/public.service.js';
import { extractApiError } from '../services/api.js';
import { useFormatters } from '../composables/useFormatters.js';

const route = useRoute();
const { formatDate } = useFormatters();

const code = ref(String(route.query.code || ''));
const result = ref(null);
const errorMessage = ref('');
const loading = ref(false);

async function handleVerify() {
  if (!code.value.trim()) return;
  loading.value = true;
  errorMessage.value = '';
  result.value = null;
  try {
    const res = await publicService.verifyCertificate(code.value.trim());
    result.value = res.certificate;
  } catch (err) {
    errorMessage.value = extractApiError(err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (code.value.trim()) {
    handleVerify();
  }
});
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="rounded-3xl border border-surface-border bg-white p-8 shadow-float text-center">
      <Award class="mx-auto h-12 w-12 text-brand-600" />
      <h1 class="mt-3 text-3xl font-extrabold text-brand-900">Certificate Verification</h1>
      <p class="mt-2 text-sm text-slate-600">
        Enter a unique Meekoo certificate code to verify graduate authenticity.
      </p>

      <form class="mt-6 flex flex-col gap-3 sm:flex-row" @submit.prevent="handleVerify">
        <input
          v-model="code"
          type="text"
          required
          placeholder="e.g. MKO-1-4-A1B2C3"
          class="min-h-[48px] flex-1 rounded-xl border border-surface-border px-4 text-sm uppercase"
        />
        <button
          type="submit"
          :disabled="loading"
          class="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-bold text-white hover:bg-brand-700"
        >
          <Search class="h-4 w-4" />
          {{ loading ? 'Checking...' : 'Verify' }}
        </button>
      </form>

      <div v-if="errorMessage" role="alert" class="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <div
        v-if="result"
        class="mt-8 rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-white p-8 text-left space-y-4"
      >
        <div class="flex items-center gap-2 text-emerald-700 font-bold text-sm">
          <CheckCircle2 class="h-5 w-5" />
          <span>Verified Official Meekoo Certificate</span>
        </div>
        <h2 class="text-2xl font-extrabold text-brand-900">{{ result.student_name }}</h2>
        <p class="text-sm text-slate-600">
          has successfully completed <strong>{{ result.course_title }}</strong> ({{ result.duration_hours }} hours), mentored by
          <strong>{{ result.mentor_name }}</strong> ({{ result.mentor_title }}).
        </p>
        <div class="flex flex-wrap justify-between gap-2 border-t border-emerald-200 pt-4 text-xs text-slate-600">
          <span>Issued: {{ formatDate(result.issued_at) }}</span>
          <span class="font-mono font-bold text-brand-900">{{ result.certificate_code }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
