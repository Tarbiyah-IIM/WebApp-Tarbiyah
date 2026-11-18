<script setup>
import { computed, onMounted, ref } from 'vue';
import {
  LayoutDashboard,
  BookOpen,
  Globe,
  Users,
  Video,
  Trash2,
  CheckCircle2
} from 'lucide-vue-next';
import { adminService } from '../services/admin.service.js';
import { extractApiError } from '../services/api.js';
import { useAsyncState } from '../composables/useAsyncState.js';
import { useFormatters } from '../composables/useFormatters.js';
import { useToast } from '../composables/useToast.js';
import { useI18n } from '../composables/useI18n.js';
import StateFeedback from '../components/StateFeedback.vue';
import AdminCatalogPanel from '../components/dashboard/AdminCatalogPanel.vue';
import AdminLandingCmsPanel from '../components/dashboard/AdminLandingCmsPanel.vue';

const toast = useToast();
const { t } = useI18n();
const { formatPrice, formatDateTime } = useFormatters();
const { loading, error, isOffline, run } = useAsyncState();

const activeTab = ref('overview');
const stats = ref({});
const orders = ref([]);
const users = ref([]);
const sessions = ref([]);
const courses = ref([]);

const sessionForm = ref({
  courseId: '',
  title: '',
  startsAt: '',
  platform: 'zoom',
  meetingUrl: 'https://zoom.us/j/123456789'
});

const tabs = computed(() => [
  { id: 'overview', label: t('adminDashboard.tabs.overview'), icon: LayoutDashboard },
  { id: 'catalog', label: t('adminDashboard.tabs.catalog'), icon: BookOpen },
  { id: 'cms', label: t('adminDashboard.tabs.cms'), icon: Globe },
  { id: 'users', label: t('adminDashboard.tabs.users'), icon: Users },
  { id: 'sessions', label: t('adminDashboard.tabs.sessions'), icon: Video }
]);

async function fetchOverviewData() {
  await run(async () => {
    const [ov, oRes, uRes, sRes, cRes] = await Promise.all([
      adminService.getOverview(),
      adminService.listOrders(),
      adminService.listUsers(),
      adminService.listLiveSessions(),
      adminService.listCourses()
    ]);
    stats.value = ov.stats;
    orders.value = oRes.items;
    users.value = uRes.items;
    sessions.value = sRes.items;
    courses.value = cRes.items;
    if (cRes.items.length > 0 && !sessionForm.value.courseId) {
      sessionForm.value.courseId = cRes.items[0].id;
    }
  });
}

async function markOrder(orderId, status) {
  try {
    await adminService.updateOrderStatus(orderId, status);
    toast.success(
      t('adminDashboard.toasts.orderUpdatedPrefix') + status + t('adminDashboard.toasts.orderUpdatedSuffix')
    );
    await fetchOverviewData();
  } catch (err) {
    toast.error(extractApiError(err));
  }
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

async function createSession() {
  try {
    await adminService.createLiveSession({
      ...sessionForm.value,
      courseId: Number(sessionForm.value.courseId)
    });
    sessionForm.value.title = '';
    await fetchOverviewData();
    toast.success(t('adminDashboard.toasts.sessionCreated'));
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function deleteSession(id) {
  await adminService.deleteLiveSession(id);
  await fetchOverviewData();
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

    <StateFeedback :loading="loading" :error="error" :offline="isOffline" @retry="fetchOverviewData">
      <div v-if="activeTab === 'overview'" class="space-y-6">
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div class="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
            <p class="text-xs font-bold uppercase text-slate-500">{{ t('adminDashboard.stats.students') }}</p>
            <p class="mt-1 text-2xl font-extrabold text-brand-900">{{ stats.totalStudents || 0 }}</p>
          </div>
          <div class="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
            <p class="text-xs font-bold uppercase text-slate-500">{{ t('adminDashboard.stats.coursesLive') }}</p>
            <p class="mt-1 text-2xl font-extrabold text-brand-900">{{ stats.publishedCourses || 0 }} / {{ stats.totalCourses || 0 }}</p>
          </div>
          <div class="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
            <p class="text-xs font-bold uppercase text-slate-500">{{ t('adminDashboard.stats.pendingReview') }}</p>
            <p class="mt-1 text-2xl font-extrabold text-amber-600">{{ stats.pendingApprovals || 0 }}</p>
          </div>
          <div class="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
            <p class="text-xs font-bold uppercase text-slate-500">{{ t('adminDashboard.stats.paidOrders') }}</p>
            <p class="mt-1 text-2xl font-extrabold text-brand-900">{{ stats.paidOrders || 0 }}</p>
          </div>
          <div class="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
            <p class="text-xs font-bold uppercase text-slate-500">{{ t('adminDashboard.stats.revenue') }}</p>
            <p class="mt-1 text-2xl font-extrabold text-emerald-600">{{ formatPrice(stats.totalRevenue || 0) }}</p>
          </div>
        </div>

        <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
          <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.ordersHeading') }}</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-surface-border text-xs uppercase text-slate-500">
                <tr>
                  <th class="py-3 pr-4">{{ t('adminDashboard.ordersCols.order') }}</th>
                  <th class="py-3 pr-4">{{ t('adminDashboard.ordersCols.learner') }}</th>
                  <th class="py-3 pr-4">{{ t('adminDashboard.ordersCols.items') }}</th>
                  <th class="py-3 pr-4">{{ t('adminDashboard.ordersCols.total') }}</th>
                  <th class="py-3 pr-4">{{ t('adminDashboard.ordersCols.status') }}</th>
                  <th class="py-3 text-right">{{ t('adminDashboard.ordersCols.action') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-border">
                <tr v-for="o in orders" :key="o.id">
                  <td class="py-3 pr-4 font-bold text-brand-900">{{ o.order_code }}</td>
                  <td class="py-3 pr-4 text-xs">{{ o.user_name }} ({{ o.user_email }})</td>
                  <td class="py-3 pr-4 text-xs">{{ o.items.map((i) => i.item_title).join(', ') }}</td>
                  <td class="py-3 pr-4 font-bold">{{ formatPrice(o.total, o.currency) }}</td>
                  <td class="py-3 pr-4">
                    <span
                      class="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase"
                      :class="{
                        'bg-emerald-100 text-emerald-800': o.status === 'paid',
                        'bg-amber-100 text-amber-800': o.status === 'pending',
                        'bg-rose-100 text-rose-800': o.status === 'failed'
                      }"
                    >
                      {{ o.status }}
                    </span>
                  </td>
                  <td class="py-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      v-if="o.status !== 'paid'"
                      type="button"
                      class="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white"
                      @click="markOrder(o.id, 'paid')"
                    >
                      <CheckCircle2 class="h-3.5 w-3.5" />
                      {{ t('adminDashboard.markPaidBtn') }}
                    </button>
                    <button
                      v-if="o.status === 'pending'"
                      type="button"
                      class="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700"
                      @click="markOrder(o.id, 'failed')"
                    >
                      {{ t('adminDashboard.markFailedBtn') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <AdminCatalogPanel v-else-if="activeTab === 'catalog'" />
      <AdminLandingCmsPanel v-else-if="activeTab === 'cms'" />

      <section v-else-if="activeTab === 'users'" class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
        <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.usersHeading') }}</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-surface-border text-xs uppercase text-slate-500">
              <tr>
                <th class="py-3 pr-4">{{ t('adminDashboard.usersCols.user') }}</th>
                <th class="py-3 pr-4">{{ t('adminDashboard.usersCols.email') }}</th>
                <th class="py-3 pr-4">{{ t('adminDashboard.usersCols.role') }}</th>
                <th class="py-3 pr-4">{{ t('adminDashboard.usersCols.enrolled') }}</th>
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
                <td class="py-3 pr-4 text-xs">{{ u.enrolled_courses }} {{ t('adminDashboard.coursesSuffix') }}</td>
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

      <section v-else-if="activeTab === 'sessions'" class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-5">
        <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.sessionsHeading') }}</h2>
        <form class="grid grid-cols-1 gap-3 sm:grid-cols-5" @submit.prevent="createSession">
          <select v-model="sessionForm.courseId" required class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm">
            <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.title }}</option>
          </select>
          <input v-model="sessionForm.title" type="text" required :placeholder="t('adminDashboard.sessionTitlePlaceholder')" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm" />
          <input v-model="sessionForm.startsAt" type="datetime-local" required class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm" />
          <input v-model="sessionForm.meetingUrl" type="url" required :placeholder="t('adminDashboard.meetingUrlPlaceholder')" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm" />
          <button type="submit" class="min-h-[40px] rounded-xl bg-brand-600 px-4 text-xs font-bold text-white">{{ t('adminDashboard.addSessionBtn') }}</button>
        </form>
        <div class="space-y-2">
          <div v-for="s in sessions" :key="s.id" class="flex items-center justify-between rounded-xl bg-surface-page px-4 py-3 text-sm">
            <div>
              <p class="font-bold text-brand-900">{{ s.title }}</p>
              <p class="text-xs text-slate-500">{{ s.course_title }} · {{ formatDateTime(s.starts_at) }} · {{ s.registered_count }} {{ t('adminDashboard.registeredSuffix') }}</p>
            </div>
            <button type="button" class="text-rose-600 hover:bg-rose-50 p-2 rounded-lg" @click="deleteSession(s.id)">
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </StateFeedback>
  </div>
</template>
