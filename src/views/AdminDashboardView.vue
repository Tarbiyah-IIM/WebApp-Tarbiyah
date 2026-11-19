<script setup>
import { computed, onMounted, ref } from 'vue';
import { Globe, Users } from 'lucide-vue-next';
import { adminService } from '../services/admin.service.js';
import { extractApiError } from '../services/api.js';
import { useAsyncState } from '../composables/useAsyncState.js';
import { useToast } from '../composables/useToast.js';
import { useI18n } from '../composables/useI18n.js';
import StateFeedback from '../components/StateFeedback.vue';
import AdminLandingCmsPanel from '../components/dashboard/AdminLandingCmsPanel.vue';

const toast = useToast();
const { t } = useI18n();
const { loading, error, isOffline, run } = useAsyncState();

const activeTab = ref('cms');
const stats = ref({});
const users = ref([]);

const tabs = computed(() => [
  { id: 'cms', label: t('adminDashboard.tabs.cms'), icon: Globe },
  { id: 'users', label: t('adminDashboard.tabs.users'), icon: Users }
]);

async function fetchOverviewData() {
  await run(async () => {
    const [ov, uRes] = await Promise.all([
      adminService.getOverview(),
      adminService.listUsers()
    ]);
    stats.value = ov.stats;
    users.value = uRes.items;
  });
}

async function updateUserRole(user, role) {
  try {
    await adminService.updateUser(user.id, { role, isActive: Boolean(user.is_active) });
    toast.success(user.name + t('adminDashboard.toasts.roleUpdatedSuffix') + role + '.');
    await fetchOverviewData();
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function toggleUserActive(user) {
  try {
    await adminService.updateUser(user.id, { role: user.role, isActive: !user.is_active });
    toast.success(t('adminDashboard.toasts.userStatusUpdated'));
    await fetchOverviewData();
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

onMounted(fetchOverviewData);
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
    <div class="rounded-3xl bg-brand-900 p-8 text-white">
      <p class="text-xs font-bold uppercase tracking-wider text-amber-300">{{ t('adminDashboard.badge') }}</p>
      <h1 class="mt-1 text-3xl font-extrabold">{{ t('adminDashboard.heading') }}</h1>
      <p class="mt-1 text-sm text-slate-300">
        {{ t('adminDashboard.subtitle') }}
      </p>
    </div>

    <StateFeedback :loading="loading" :error="error" :offline="isOffline" @retry="fetchOverviewData">
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div class="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
          <p class="text-xs font-bold uppercase text-slate-500">{{ t('adminDashboard.stats.users') }}</p>
          <p class="mt-1 text-2xl font-extrabold text-brand-900">{{ stats.totalUsers || 0 }}</p>
        </div>
        <div class="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
          <p class="text-xs font-bold uppercase text-slate-500">{{ t('adminDashboard.stats.news') }}</p>
          <p class="mt-1 text-2xl font-extrabold text-brand-900">{{ stats.totalNews || 0 }}</p>
        </div>
        <div class="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
          <p class="text-xs font-bold uppercase text-slate-500">{{ t('adminDashboard.stats.faqs') }}</p>
          <p class="mt-1 text-2xl font-extrabold text-brand-900">{{ stats.totalFaqs || 0 }}</p>
        </div>
        <div class="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
          <p class="text-xs font-bold uppercase text-slate-500">{{ t('adminDashboard.stats.services') }}</p>
          <p class="mt-1 text-2xl font-extrabold text-brand-900">{{ stats.totalServices || 0 }}</p>
        </div>
        <div class="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
          <p class="text-xs font-bold uppercase text-slate-500">{{ t('adminDashboard.stats.features') }}</p>
          <p class="mt-1 text-2xl font-extrabold text-emerald-600">{{ stats.totalFeatures || 0 }}</p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-sm font-bold transition"
          :class="
            activeTab === tab.id
              ? 'bg-brand-600 text-white shadow-sm'
              : 'border border-surface-border bg-white text-slate-700 hover:bg-brand-50'
          "
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" class="h-4 w-4" />
          {{ tab.label }}
        </button>
      </div>

      <AdminLandingCmsPanel v-if="activeTab === 'cms'" />

      <section v-else-if="activeTab === 'users'" class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
        <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.usersHeading') }}</h2>
        <div class="overflow-x-auto">
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
              <tr v-for="u in users" :key="u.id">
                <td class="py-3 pr-4 font-bold text-brand-900">{{ u.name }}</td>
                <td class="py-3 pr-4 text-xs">{{ u.email }}</td>
                <td class="py-3 pr-4">
                  <select
                    :value="u.role"
                    class="rounded-lg border border-surface-border px-2.5 py-1 text-xs font-semibold"
                    @change="updateUserRole(u, $event.target.value)"
                  >
                    <option value="student">student</option>
                    <option value="mentor">mentor</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td class="py-3 text-right">
                  <button
                    type="button"
                    class="rounded-lg px-3 py-1 text-xs font-bold"
                    :class="u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
                    @click="toggleUserActive(u)"
                  >
                    {{ u.is_active ? t('adminDashboard.activeStatus') : t('adminDashboard.suspendedStatus') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </StateFeedback>
  </div>
</template>
