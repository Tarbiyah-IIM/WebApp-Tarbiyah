<script setup>
import { onMounted, ref } from 'vue';
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
import StateFeedback from '../components/StateFeedback.vue';
import AdminCatalogPanel from '../components/dashboard/AdminCatalogPanel.vue';
import AdminLandingCmsPanel from '../components/dashboard/AdminLandingCmsPanel.vue';

const toast = useToast();
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

const tabs = [
  { id: 'overview', label: 'Overview & Orders', icon: LayoutDashboard },
  { id: 'catalog', label: 'Catalog & Approvals', icon: BookOpen },
  { id: 'cms', label: 'Landing Page CMS', icon: Globe },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'sessions', label: 'Live Sessions', icon: Video }
];

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
    toast.success(`Order updated to ${status} and enrollments synced.`);
    await fetchOverviewData();
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function updateUserRole(user, role) {
  try {
    await adminService.updateUser(user.id, { role, isActive: Boolean(user.is_active) });
    toast.success(`${user.name} role updated to ${role}.`);
    await fetchOverviewData();
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function toggleUserActive(user) {
  try {
    await adminService.updateUser(user.id, { role: user.role, isActive: !user.is_active });
    toast.success(`Account status updated.`);
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
    toast.success('Live session created.');
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
      <p class="text-xs font-bold uppercase tracking-wider text-amber-300">Admin Control Center</p>
      <h1 class="mt-1 text-3xl font-extrabold">Meekoo Operations & Content Sync</h1>
      <p class="mt-1 text-sm text-slate-300">
        Every update here synchronizes immediately with the Landing Page, Catalog, Student Dashboard, and Mentor Studio.
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
            <p class="text-xs font-bold uppercase text-slate-500">Students</p>
            <p class="mt-1 text-2xl font-extrabold text-brand-900">{{ stats.totalStudents || 0 }}</p>
          </div>
          <div class="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
            <p class="text-xs font-bold uppercase text-slate-500">Courses Live</p>
            <p class="mt-1 text-2xl font-extrabold text-brand-900">{{ stats.publishedCourses || 0 }} / {{ stats.totalCourses || 0 }}</p>
          </div>
          <div class="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
            <p class="text-xs font-bold uppercase text-slate-500">Pending Review</p>
            <p class="mt-1 text-2xl font-extrabold text-amber-600">{{ stats.pendingApprovals || 0 }}</p>
          </div>
          <div class="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
            <p class="text-xs font-bold uppercase text-slate-500">Paid Orders</p>
            <p class="mt-1 text-2xl font-extrabold text-brand-900">{{ stats.paidOrders || 0 }}</p>
          </div>
          <div class="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
            <p class="text-xs font-bold uppercase text-slate-500">Total Revenue</p>
            <p class="mt-1 text-2xl font-extrabold text-emerald-600">{{ formatPrice(stats.totalRevenue || 0) }}</p>
          </div>
        </div>

        <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
          <h2 class="text-lg font-extrabold text-brand-900">Orders & Payment Reconciliation</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-surface-border text-xs uppercase text-slate-500">
                <tr>
                  <th class="py-3 pr-4">Order</th>
                  <th class="py-3 pr-4">Learner</th>
                  <th class="py-3 pr-4">Items</th>
                  <th class="py-3 pr-4">Total</th>
                  <th class="py-3 pr-4">Status</th>
                  <th class="py-3 text-right">Action</th>
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
                  <td class="py-3 text-right">
                    <button
                      v-if="o.status !== 'paid'"
                      type="button"
                      class="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white"
                      @click="markOrder(o.id, 'paid')"
                    >
                      <CheckCircle2 class="h-3.5 w-3.5" />
                      Mark Paid
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
        <h2 class="text-lg font-extrabold text-brand-900">User & Role Synchronization</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-surface-border text-xs uppercase text-slate-500">
              <tr>
                <th class="py-3 pr-4">User</th>
                <th class="py-3 pr-4">Email</th>
                <th class="py-3 pr-4">Role</th>
                <th class="py-3 pr-4">Enrolled</th>
                <th class="py-3 text-right">Status</th>
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
                <td class="py-3 pr-4 text-xs">{{ u.enrolled_courses }} courses</td>
                <td class="py-3 text-right">
                  <button
                    type="button"
                    class="rounded-lg px-3 py-1 text-xs font-bold"
                    :class="u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
                    @click="toggleUserActive(u)"
                  >
                    {{ u.is_active ? 'Active' : 'Suspended' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-else-if="activeTab === 'sessions'" class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-5">
        <h2 class="text-lg font-extrabold text-brand-900">Manage Live Sessions</h2>
        <form class="grid grid-cols-1 gap-3 sm:grid-cols-5" @submit.prevent="createSession">
          <select v-model="sessionForm.courseId" required class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm">
            <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.title }}</option>
          </select>
          <input v-model="sessionForm.title" type="text" required placeholder="Session Title" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm" />
          <input v-model="sessionForm.startsAt" type="datetime-local" required class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm" />
          <input v-model="sessionForm.meetingUrl" type="url" required placeholder="Zoom / Meet URL" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm" />
          <button type="submit" class="min-h-[40px] rounded-xl bg-brand-600 px-4 text-xs font-bold text-white">Add Session</button>
        </form>
        <div class="space-y-2">
          <div v-for="s in sessions" :key="s.id" class="flex items-center justify-between rounded-xl bg-surface-page px-4 py-3 text-sm">
            <div>
              <p class="font-bold text-brand-900">{{ s.title }}</p>
              <p class="text-xs text-slate-500">{{ s.course_title }} · {{ formatDateTime(s.starts_at) }} · {{ s.registered_count }} registered</p>
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
