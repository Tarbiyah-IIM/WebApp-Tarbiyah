<script setup>
import { onMounted, ref } from 'vue';
import { Video, Calendar, ExternalLink, CheckCircle2 } from 'lucide-vue-next';
import { studentService } from '../../services/student.service.js';
import { extractApiError } from '../../services/api.js';
import { useFormatters } from '../../composables/useFormatters.js';
import { useToast } from '../../composables/useToast.js';

const toast = useToast();
const { formatDateTime } = useFormatters();

const sessions = ref([]);
const loading = ref(false);

async function fetchSessions() {
  loading.value = true;
  try {
    const res = await studentService.getLiveSessions();
    sessions.value = res.items;
  } catch (err) {
    toast.error(extractApiError(err));
  } finally {
    loading.value = false;
  }
}

async function toggleRegistration(session) {
  try {
    if (session.is_registered) {
      await studentService.unregisterLiveSession(session.id);
      toast.info('Session registration cancelled.');
    } else {
      await studentService.registerLiveSession(session.id);
      toast.success('Registered! Meeting link unlocked.');
    }
    await fetchSessions();
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

onMounted(fetchSessions);
</script>

<template>
  <div class="space-y-4">
    <div v-if="loading" class="rounded-2xl bg-white p-6 text-sm text-slate-500">Loading live sessions...</div>
    <div v-else-if="sessions.length === 0" class="rounded-2xl border border-surface-border bg-white p-8 text-center text-sm text-slate-500">
      No upcoming live sessions scheduled right now.
    </div>

    <div
      v-for="session in sessions"
      :key="session.id"
      class="flex flex-col justify-between gap-4 rounded-2xl border border-surface-border bg-white p-6 shadow-card sm:flex-row sm:items-center"
    >
      <div class="space-y-1.5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-full bg-brand-50 px-3 py-0.5 text-xs font-bold text-brand-700 uppercase">
            {{ session.platform === 'google_meet' ? 'Google Meet' : 'Zoom' }}
          </span>
          <span class="text-xs font-semibold text-slate-500">{{ session.course_title }}</span>
        </div>
        <h3 class="text-lg font-extrabold text-brand-900">{{ session.title }}</h3>
        <p class="text-sm text-slate-600">{{ session.description }}</p>
        <div class="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
          <span class="inline-flex items-center gap-1">
            <Calendar class="h-3.5 w-3.5 text-brand-600" />
            {{ formatDateTime(session.starts_at) }} ({{ session.duration_min }} mins)
          </span>
          <span>Mentor: {{ session.mentor_name }}</span>
          <span>{{ session.registered_count }} registered</span>
        </div>
      </div>

      <div class="flex flex-col items-stretch gap-2 sm:items-end shrink-0">
        <a
          v-if="session.is_registered && session.meeting_url"
          :href="session.meeting_url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700"
        >
          <Video class="h-4 w-4" />
          Join Meeting
          <ExternalLink class="h-3.5 w-3.5" />
        </a>
        <button
          type="button"
          class="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold transition"
          :class="
            session.is_registered
              ? 'border border-surface-border bg-surface-page text-slate-700 hover:bg-rose-50 hover:text-rose-700'
              : 'bg-brand-600 text-white hover:bg-brand-700'
          "
          @click="toggleRegistration(session)"
        >
          <CheckCircle2 v-if="session.is_registered" class="h-4 w-4 text-emerald-600" />
          <span>{{ session.is_registered ? 'Registered (Cancel)' : 'Register Seat' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
