<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  BookOpen,
  Crown,
  Award,
  Video,
  Compass,
  Receipt,
  UserCog,
  Play,
  Trash2
} from 'lucide-vue-next';
import { studentService } from '../services/student.service.js';
import { authService } from '../services/auth.service.js';
import { extractApiError } from '../services/api.js';
import { useAuthStore } from '../stores/auth.store.js';
import { useAsyncState } from '../composables/useAsyncState.js';
import { useFormatters } from '../composables/useFormatters.js';
import { useToast } from '../composables/useToast.js';
import { useI18n } from '../composables/useI18n.js';
import StateFeedback from '../components/StateFeedback.vue';
import CourseCard from '../components/CourseCard.vue';
import StudentLivePanel from '../components/dashboard/StudentLivePanel.vue';
import StudentPathPanel from '../components/dashboard/StudentPathPanel.vue';
import ModalDialog from '../components/ModalDialog.vue';

const router = useRouter();
const auth = useAuthStore();
const toast = useToast();
const { t } = useI18n();
const { formatPrice, formatDate } = useFormatters();
const { loading, error, isOffline, run } = useAsyncState();

const activeTab = ref('courses');
const coursesData = ref({ hasPremium: false, enrolled: [], premiumCourses: [], recommended: [] });
const orders = ref([]);
const certificates = ref([]);
const subscription = ref(null);

const profileForm = ref({ name: '', bio: '', newPassword: '' });
const deleteModalOpen = ref(false);
const savingProfile = ref(false);

const tabs = computed(() => [
  { id: 'courses', label: t('studentDashboard.tabs.courses'), icon: BookOpen },
  { id: 'live', label: t('studentDashboard.tabs.live'), icon: Video },
  { id: 'paths', label: t('studentDashboard.tabs.paths'), icon: Compass },
  { id: 'orders', label: t('studentDashboard.tabs.orders'), icon: Receipt },
  { id: 'certificates', label: t('studentDashboard.tabs.certificates'), icon: Award },
  { id: 'profile', label: t('studentDashboard.tabs.profile'), icon: UserCog }
]);

async function fetchDashboard() {
  await run(async () => {
    const [cRes, oRes, certRes, subRes] = await Promise.all([
      studentService.getMyCourses(),
      studentService.getMyOrders(),
      studentService.getMyCertificates(),
      studentService.getMySubscription()
    ]);
    coursesData.value = cRes;
    orders.value = oRes.items;
    certificates.value = certRes.items;
    subscription.value = subRes.subscription;
    profileForm.value.name = auth.user?.name || '';
    profileForm.value.bio = auth.user?.bio || '';
  });
}

async function toggleAutoRenew() {
  if (!subscription.value) return;
  try {
    const res = await studentService.toggleAutoRenew(!subscription.value.auto_renew);
    subscription.value = res.subscription;
    toast.success(t('studentDashboard.autoRenewUpdatedToast'));
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function saveProfile() {
  savingProfile.value = true;
  try {
    const payload = {
      name: profileForm.value.name,
      bio: profileForm.value.bio
    };
    if (profileForm.value.newPassword.trim()) {
      payload.newPassword = profileForm.value.newPassword.trim();
    }
    await authService.updateMe(payload);
    await auth.refreshProfile();
    profileForm.value.newPassword = '';
    toast.success(t('studentDashboard.profileUpdatedToast'));
  } catch (err) {
    toast.error(extractApiError(err));
  } finally {
    savingProfile.value = false;
  }
}

async function confirmDeleteAccount() {
  try {
    await authService.deleteMe();
    auth.clearSession();
    deleteModalOpen.value = false;
    toast.info(t('studentDashboard.accountDeletedToast'));
    router.push('/');
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

onMounted(fetchDashboard);
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <div class="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-brand-900 p-8 text-white">
      <div>
        <p class="text-xs font-bold uppercase tracking-wider text-brand-200">{{ t('studentDashboard.badge') }}</p>
        <h1 class="mt-1 text-3xl font-extrabold">{{ t('studentDashboard.welcomePrefix') }}{{ auth.user?.name }}</h1>
        <p class="mt-1 text-sm text-slate-300">
          {{ t('studentDashboard.subtitle') }}
        </p>
      </div>
      <div v-if="coursesData.hasPremium" class="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 text-sm font-extrabold text-slate-900">
        <Crown class="h-5 w-5" />
        {{ t('studentDashboard.premiumActive') }}
      </div>
      <router-link
        v-else
        to="/checkout?plan=premium"
        class="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-900 hover:bg-amber-300"
      >
        <Crown class="h-4 w-4" />
        {{ t('studentDashboard.upgradePremium') }}
      </router-link>
    </div>

    <div class="mb-8 flex flex-wrap gap-2">
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

    <StateFeedback :loading="loading" :error="error" :offline="isOffline" @retry="fetchDashboard">
      <div v-if="activeTab === 'courses'" class="space-y-10">
        <div>
          <h2 class="text-xl font-extrabold text-brand-900 mb-4">{{ t('studentDashboard.enrolledHeading') }} ({{ coursesData.enrolled.length }})</h2>
          <div
            v-if="coursesData.enrolled.length === 0 && !coursesData.hasPremium"
            class="rounded-2xl border border-surface-border bg-white p-8 text-center space-y-3"
          >
            <p class="text-sm text-slate-600">{{ t('studentDashboard.noEnrolled') }}</p>
            <router-link to="/courses" class="inline-flex min-h-[44px] items-center rounded-xl bg-brand-600 px-5 text-sm font-bold text-white">
              {{ t('studentDashboard.browseCatalogBtn') }}
            </router-link>
          </div>
          <p v-else-if="coursesData.enrolled.length === 0" class="text-sm text-slate-600">
            {{ t('studentDashboard.premiumPrompt') }}
          </p>
          <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <article
              v-for="course in coursesData.enrolled"
              :key="course.id"
              class="flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card"
            >
              <img
                :src="course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80'"
                :alt="course.title"
                class="aspect-[16/9] w-full object-cover"
              />
              <div class="flex flex-1 flex-col p-5 space-y-3">
                <span class="text-xs font-bold text-brand-600">{{ course.category_name }}</span>
                <h3 class="text-base font-extrabold text-brand-900">{{ course.title }}</h3>
                <div class="mt-auto space-y-2 pt-2">
                  <div class="flex justify-between text-xs font-semibold text-slate-600">
                    <span>{{ t('studentDashboard.progressLabel') }}</span>
                    <span>{{ Number(course.progress_pct).toFixed(0) }}%</span>
                  </div>
                  <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      class="h-full rounded-full bg-emerald-500"
                      :style="{ width: `${Math.min(100, Number(course.progress_pct))}%` }"
                    />
                  </div>
                  <router-link
                    :to="`/learn/${course.id}`"
                    class="mt-2 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700"
                  >
                    <Play class="h-4 w-4" />
                    {{ Number(course.progress_pct) > 0 ? t('studentDashboard.resumeBtn') : t('studentDashboard.startBtn') }}
                  </router-link>
                </div>
              </div>
            </article>
          </div>
        </div>

        <div v-if="coursesData.hasPremium && coursesData.premiumCourses?.length > 0">
          <h2 class="text-xl font-extrabold text-brand-900 mb-4">{{ t('studentDashboard.premiumLibHeading') }} ({{ coursesData.premiumCourses.length }})</h2>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <article
              v-for="course in coursesData.premiumCourses"
              :key="`prem-${course.id}`"
              class="flex flex-col overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-card"
            >
              <img
                :src="course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80'"
                :alt="course.title"
                class="aspect-[16/9] w-full object-cover"
              />
              <div class="flex flex-1 flex-col p-5 space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-bold text-brand-600">{{ course.category_name }}</span>
                  <span class="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">{{ t('studentDashboard.premiumUnlocked') }}</span>
                </div>
                <h3 class="text-base font-extrabold text-brand-900">{{ course.title }}</h3>
                <p class="text-xs text-slate-500">{{ t('studentDashboard.mentorPrefix') }}{{ course.mentor_name }} · {{ course.total_videos }} {{ t('studentDashboard.videosSuffix') }}</p>
                <router-link
                  :to="`/learn/${course.id}`"
                  class="mt-auto inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700"
                >
                  <Play class="h-4 w-4" />
                  {{ t('studentDashboard.startBtn') }}
                </router-link>
              </div>
            </article>
          </div>
        </div>

        <div v-if="coursesData.recommended.length > 0">
          <h2 class="text-xl font-extrabold text-brand-900 mb-4">{{ t('studentDashboard.recommendedHeading') }}</h2>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <CourseCard
              v-for="course in coursesData.recommended"
              :key="course.id"
              :course="course"
            />
          </div>
        </div>
      </div>

      <StudentLivePanel v-else-if="activeTab === 'live'" />
      <StudentPathPanel v-else-if="activeTab === 'paths'" />

      <div v-else-if="activeTab === 'orders'" class="space-y-6">
        <div v-if="subscription" class="rounded-2xl border border-brand-200 bg-brand-50 p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase text-brand-700">{{ t('studentDashboard.premiumMembershipBadge') }}</p>
            <h3 class="text-lg font-extrabold text-brand-900">
              {{ t('studentDashboard.activeUntilPrefix') }}{{ formatDate(subscription.ends_at) }}
            </h3>
            <p class="text-xs text-slate-600">{{ t('studentDashboard.autoRenewPrefix') }}{{ subscription.auto_renew ? t('studentDashboard.enabledLabel') : t('studentDashboard.disabledLabel') }}</p>
          </div>
          <button
            type="button"
            class="min-h-[42px] rounded-xl border border-brand-300 bg-white px-4 text-xs font-bold text-brand-700 hover:bg-brand-100"
            @click="toggleAutoRenew"
          >
            {{ subscription.auto_renew ? t('studentDashboard.disableAutoRenew') : t('studentDashboard.enableAutoRenew') }}
          </button>
        </div>

        <div class="rounded-2xl border border-surface-border bg-white p-6 shadow-card">
          <h2 class="text-lg font-extrabold text-brand-900 mb-4">{{ t('studentDashboard.orderHistoryHeading') }}</h2>
          <p v-if="orders.length === 0" class="text-sm text-slate-500">{{ t('studentDashboard.noOrders') }}</p>
          <div v-else class="space-y-3">
            <div
              v-for="order in orders"
              :key="order.id"
              class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-surface-border bg-surface-page p-4"
            >
              <div>
                <p class="text-sm font-extrabold text-brand-900">{{ order.order_code }}</p>
                <p class="text-xs text-slate-500">
                  {{ order.items.map((i) => i.item_title).join(', ') }} · {{ formatDate(order.created_at) }}
                </p>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm font-extrabold text-brand-900">{{ formatPrice(order.total, order.currency) }}</span>
                <span
                  class="rounded-full px-3 py-1 text-xs font-bold uppercase"
                  :class="{
                    'bg-emerald-100 text-emerald-800': order.status === 'paid',
                    'bg-amber-100 text-amber-800': order.status === 'pending',
                    'bg-rose-100 text-rose-800': order.status === 'failed'
                  }"
                >
                  {{ order.status }}
                </span>
                <router-link
                  v-if="order.status === 'pending'"
                  :to="`/checkout/${order.id}`"
                  class="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white"
                >
                  {{ t('studentDashboard.payNowBtn') }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'certificates'" class="rounded-2xl border border-surface-border bg-white p-6 shadow-card">
        <h2 class="text-lg font-extrabold text-brand-900 mb-4">{{ t('studentDashboard.certificatesHeading') }}</h2>
        <p v-if="certificates.length === 0" class="text-sm text-slate-500">
          {{ t('studentDashboard.noCertificates') }}
        </p>
        <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            v-for="cert in certificates"
            :key="cert.id"
            class="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-2"
          >
            <div class="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase">
              <Award class="h-4 w-4" />
              <span>{{ cert.certificate_code }}</span>
            </div>
            <h3 class="text-base font-extrabold text-brand-900">{{ cert.course_title }}</h3>
            <p class="text-xs text-slate-600">{{ t('studentDashboard.mentorPrefix') }}{{ cert.mentor_name }}{{ t('studentDashboard.issuedPrefix') }}{{ formatDate(cert.issued_at) }}</p>
            <router-link
              :to="`/verify-certificate?code=${cert.certificate_code}`"
              class="inline-flex min-h-[38px] items-center rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700"
            >
              {{ t('studentDashboard.openVerifyBtn') }}
            </router-link>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'profile'" class="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form class="lg:col-span-7 rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4" @submit.prevent="saveProfile">
          <h2 class="text-lg font-extrabold text-brand-900">{{ t('studentDashboard.profileSettingsHeading') }}</h2>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">{{ t('studentDashboard.fullNameLabel') }}</label>
            <input v-model="profileForm.name" type="text" required class="min-h-[44px] w-full rounded-xl border border-surface-border px-4 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">{{ t('studentDashboard.bioLabel') }}</label>
            <textarea v-model="profileForm.bio" rows="3" class="w-full rounded-xl border border-surface-border p-3 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">{{ t('studentDashboard.newPasswordLabel') }}</label>
            <input v-model="profileForm.newPassword" type="password" minlength="6" class="min-h-[44px] w-full rounded-xl border border-surface-border px-4 text-sm" />
          </div>
          <button
            type="submit"
            :disabled="savingProfile"
            class="min-h-[44px] rounded-xl bg-brand-600 px-6 text-sm font-bold text-white hover:bg-brand-700"
          >
            {{ savingProfile ? t('studentDashboard.savingBtn') : t('studentDashboard.saveChangesBtn') }}
          </button>
        </form>

        <div class="lg:col-span-5 rounded-2xl border border-rose-200 bg-rose-50/70 p-6 space-y-4 h-fit">
          <h2 class="text-lg font-extrabold text-rose-900">{{ t('studentDashboard.complianceHeading') }}</h2>
          <p class="text-sm text-rose-800">
            {{ t('studentDashboard.complianceDesc') }}
          </p>
          <button
            type="button"
            class="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white hover:bg-rose-700"
            @click="deleteModalOpen = true"
          >
            <Trash2 class="h-4 w-4" />
            {{ t('studentDashboard.deleteAccountBtn') }}
          </button>
        </div>
      </div>
    </StateFeedback>

    <ModalDialog :open="deleteModalOpen" :title="t('studentDashboard.deleteModalTitle')" @close="deleteModalOpen = false">
      <p class="text-sm text-slate-600 mb-6">
        {{ t('studentDashboard.deleteModalDesc') }}
      </p>
      <div class="flex justify-end gap-3">
        <button type="button" class="min-h-[42px] rounded-xl border border-surface-border px-4 text-sm font-semibold" @click="deleteModalOpen = false">
          {{ t('studentDashboard.cancelBtn') }}
        </button>
        <button type="button" class="min-h-[42px] rounded-xl bg-rose-600 px-5 text-sm font-bold text-white" @click="confirmDeleteAccount">
          {{ t('studentDashboard.confirmDeleteBtn') }}
        </button>
      </div>
    </ModalDialog>
  </div>
</template>
