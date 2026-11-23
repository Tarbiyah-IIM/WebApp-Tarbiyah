<script setup>
import { computed, ref } from 'vue';
import { Search } from 'lucide-vue-next';
import AdminConfirmModal from './AdminConfirmModal.vue';
import { useAuthStore } from '../../stores/auth.store.js';
import { useI18n } from '../../composables/useI18n.js';

const props = defineProps({
  users: { type: Array, required: true },
  syncing: { type: Boolean, default: false }
});

const emit = defineEmits(['update-role', 'toggle-active']);

const auth = useAuthStore();
const { t } = useI18n();
const searchQuery = ref('');
const pendingSuspend = ref(null);

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.users;
  return props.users.filter(
    (u) =>
      String(u.name || '').toLowerCase().includes(q) ||
      String(u.email || '').toLowerCase().includes(q)
  );
});

function handleToggleClick(user) {
  if (user.is_active) {
    pendingSuspend.value = user;
    return;
  }
  emit('toggle-active', user);
}

function confirmSuspend() {
  if (!pendingSuspend.value) return;
  const target = pendingSuspend.value;
  pendingSuspend.value = null;
  emit('toggle-active', target);
}
</script>

<template>
  <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-5">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.usersHeading') }}</h2>
      <div class="relative w-full sm:w-72">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          v-model="searchQuery"
          type="search"
          :placeholder="t('adminDashboard.usersSearchPlaceholder')"
          class="min-h-[40px] w-full rounded-xl border border-surface-border pl-9 pr-3 text-sm"
        />
      </div>
    </div>

    <p v-if="filteredUsers.length === 0" class="py-8 text-center text-sm text-slate-500">
      {{ t('adminDashboard.usersEmpty') }}
    </p>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-surface-border text-xs uppercase text-slate-500">
          <tr>
            <th class="py-3 pr-4">{{ t('adminDashboard.usersCols.user') }}</th>
            <th class="py-3 pr-4">{{ t('adminDashboard.usersCols.email') }}</th>
            <th class="py-3 pr-4">{{ t('adminDashboard.usersCols.role') }}</th>
            <th class="py-3 text-right">{{ t('adminDashboard.usersCols.status') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border">
          <tr v-for="u in filteredUsers" :key="u.id">
            <td class="py-3.5 pr-4 font-bold text-brand-900">
              <div class="flex items-center gap-2">
                <span>{{ u.name }}</span>
                <span
                  v-if="auth.user?.id === u.id"
                  class="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700"
                >
                  {{ t('adminDashboard.currentUserBadge') }}
                </span>
              </div>
            </td>
            <td class="py-3.5 pr-4 text-xs text-slate-600">{{ u.email }}</td>
            <td class="py-3.5 pr-4">
              <select
                :value="u.role"
                :disabled="syncing || auth.user?.id === u.id"
                class="min-h-[36px] rounded-xl border border-surface-border px-3 text-xs font-semibold disabled:opacity-60"
                @change="emit('update-role', u, $event.target.value)"
              >
                <option value="student">student</option>
                <option value="mentor">mentor</option>
                <option value="admin">admin</option>
              </select>
            </td>
            <td class="py-3.5 text-right">
              <button
                type="button"
                :disabled="syncing || auth.user?.id === u.id"
                class="min-h-[34px] rounded-xl px-3.5 text-xs font-bold transition disabled:opacity-50"
                :class="u.is_active ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'"
                @click="handleToggleClick(u)"
              >
                {{ u.is_active ? t('adminDashboard.activeStatus') : t('adminDashboard.suspendedStatus') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminConfirmModal
      :open="Boolean(pendingSuspend)"
      :title="t('adminDashboard.confirmSuspendTitle')"
      :description="t('adminDashboard.confirmSuspendDesc')"
      :confirm-label="t('adminDashboard.confirmSuspendBtn')"
      :cancel-label="t('adminDashboard.cancelBtn')"
      :busy="syncing"
      @confirm="confirmSuspend"
      @cancel="pendingSuspend = null"
    />
  </section>
</template>
