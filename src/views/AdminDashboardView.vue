<script setup>
import { computed, onMounted, ref } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import {
  BarChart3,
  CalendarDays,
  FileText,
  GraduationCap,
  Handshake,
  HelpCircle,
  LayoutDashboard,
  Link2,
  Newspaper,
  Settings,
  Users,
  WandSparkles
} from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth.store.js';
import { useAdminPortal } from '../composables/useAdminPortal.js';
import { useI18n } from '../composables/useI18n.js';
import { useToast } from '../composables/useToast.js';
import StateFeedback from '../components/StateFeedback.vue';
import AdminShell from '../components/dashboard/AdminShell.vue';
import AdminAccountModal from '../components/dashboard/AdminAccountModal.vue';
import AdminOverviewPanel from '../components/dashboard/AdminOverviewPanel.vue';
import AdminCmsSettingsForm from '../components/dashboard/AdminCmsSettingsForm.vue';
import AdminNewsPanel from '../components/dashboard/AdminNewsPanel.vue';
import AdminAgendaPanel from '../components/dashboard/AdminAgendaPanel.vue';
import AdminFaqPanel from '../components/dashboard/AdminFaqPanel.vue';
import AdminStatsPanel from '../components/dashboard/AdminStatsPanel.vue';
import AdminPartnersPanel from '../components/dashboard/AdminPartnersPanel.vue';
import AdminFeaturesPanel from '../components/dashboard/AdminFeaturesPanel.vue';
import AdminPortalMenuPanel from '../components/dashboard/AdminPortalMenuPanel.vue';
import AdminPortalPagesPanel from '../components/dashboard/AdminPortalPagesPanel.vue';
import AdminLecturersPanel from '../components/dashboard/AdminLecturersPanel.vue';
import AdminUsersPanel from '../components/dashboard/AdminUsersPanel.vue';
import AdminConfirmModal from '../components/dashboard/AdminConfirmModal.vue';

const router = useRouter();
const auth = useAuthStore();
const { t } = useI18n();
const toast = useToast();
const portal = useAdminPortal();
const activeTab = ref('overview');
const pendingTab = ref(null);
const pendingRoute = ref(null);
const pendingLogout = ref(false);
const unsavedConfirmOpen = ref(false);
const accountModalOpen = ref(false);
const dirtyTabs = ref(new Set());

function setTabDirty(tabId, isDirty) {
  const next = new Set(dirtyTabs.value);
  if (isDirty) next.add(tabId);
  else next.delete(tabId);
  dirtyTabs.value = next;
}

function selectTab(tabId) {
  if (tabId === activeTab.value) return;
  if (dirtyTabs.value.has(activeTab.value)) {
    pendingTab.value = tabId;
    unsavedConfirmOpen.value = true;
    return;
  }
  activeTab.value = tabId;
}

function discardAndContinue() {
  const target = pendingTab.value;
  const route = pendingRoute.value;
  const logout = pendingLogout.value;
  dirtyTabs.value = new Set();
  pendingTab.value = null;
  pendingRoute.value = null;
  pendingLogout.value = false;
  unsavedConfirmOpen.value = false;
  if (target) activeTab.value = target;
  if (route) router.push(route);
  if (logout) void performLogout();
}

function cancelUnsavedNavigation() {
  pendingTab.value = null;
  pendingRoute.value = null;
  pendingLogout.value = false;
  unsavedConfirmOpen.value = false;
}

onBeforeRouteLeave((to) => {
  if (dirtyTabs.value.size === 0 || pendingRoute.value === to.fullPath) return true;
  pendingRoute.value = to.fullPath;
  unsavedConfirmOpen.value = true;
  return false;
});

const navGroups = computed(() => [
  {
    id: 'main',
    label: t('adminDashboard.groups.main'),
    items: [{ id: 'overview', label: t('adminDashboard.nav.overview'), icon: LayoutDashboard }]
  },
  {
    id: 'content',
    label: t('adminDashboard.groups.content'),
    items: [
      { id: 'settings', label: t('adminDashboard.nav.settings'), icon: Settings },
      { id: 'news', label: t('adminDashboard.nav.news'), icon: Newspaper, count: portal.badgeCounts.value.news },
      { id: 'agendas', label: t('adminDashboard.nav.agendas'), icon: CalendarDays, count: portal.badgeCounts.value.agendas },
      { id: 'faqs', label: t('adminDashboard.nav.faqs'), icon: HelpCircle, count: portal.badgeCounts.value.faqs },
      { id: 'stats', label: t('adminDashboard.nav.stats'), icon: BarChart3, count: portal.badgeCounts.value.stats },
      { id: 'partners', label: t('adminDashboard.nav.partners'), icon: Handshake, count: portal.badgeCounts.value.partners },
      { id: 'features', label: t('adminDashboard.nav.features'), icon: WandSparkles, count: portal.badgeCounts.value.features }
    ]
  },
  {
    id: 'portal',
    label: t('adminDashboard.groups.portal'),
    items: [
      { id: 'menus', label: t('adminDashboard.nav.menus'), icon: Link2 },
      { id: 'pages', label: t('adminDashboard.nav.pages'), icon: FileText },
      { id: 'lecturers', label: t('adminDashboard.nav.lecturers'), icon: GraduationCap, count: portal.badgeCounts.value.lecturers }
    ]
  },
  {
    id: 'access',
    label: t('adminDashboard.groups.access'),
    items: [
      { id: 'users', label: t('adminDashboard.nav.users'), icon: Users, count: portal.badgeCounts.value.users }
    ]
  }
]);

async function runSafeAction(action) {
  try {
    const data = await action();
    return { ok: true, data };
  } catch {
    return { ok: false, data: undefined };
  }
}

async function handleSaveSettings(patch, customMessage) {
  await runSafeAction(() =>
    portal.saveSettingsPatch(patch, customMessage || t('adminDashboard.cmsPanel.toasts.settingsSaved'))
  );
}

async function handleSaveNews(payload, onDone) {
  const res = await runSafeAction(() => portal.saveNews(payload, t('adminDashboard.cmsPanel.toasts.newsSaved')));
  if (res.ok && onDone) onDone();
}

async function handleSaveAgenda(payload, onDone) {
  const res = await runSafeAction(() => portal.saveAgenda(payload, t('adminDashboard.cmsPanel.toasts.agendaSaved')));
  if (res.ok && onDone) onDone();
}

async function handleSaveLecturer(payload, onDone) {
  const res = await runSafeAction(() => portal.saveLecturer(payload, t('adminDashboard.cmsPanel.toasts.lecturerSaved')));
  if (res.ok && onDone) onDone();
}

async function handleDeleteLecturer(id, onDone) {
  const res = await runSafeAction(() => portal.removeLecturer(id, t('adminDashboard.cmsPanel.toasts.lecturerDeleted')));
  if (onDone) onDone(res.ok);
}

async function handleDeleteNews(id, onDone) {
  const res = await runSafeAction(() => portal.removeNews(id, t('adminDashboard.cmsPanel.toasts.newsDeleted')));
  if (onDone) onDone(res.ok);
}

async function handleDeleteNewsCategory(id, onDone) {
  const res = await runSafeAction(() => portal.removeCategory(id, t('adminDashboard.cmsPanel.toasts.categoryDeleted')));
  if (onDone) onDone(res.ok);
}

async function handleDeleteAgenda(id, onDone) {
  const res = await runSafeAction(() => portal.removeAgenda(id, t('adminDashboard.cmsPanel.toasts.agendaDeleted')));
  if (onDone) onDone(res.ok);
}

async function handleAddCategory(name, onDone) {
  const res = await runSafeAction(() => portal.addCategory(name, t('adminDashboard.cmsPanel.toasts.categorySaved')));
  if (res.ok && res.data && onDone) onDone(res.data);
}

async function handleSaveFaq(payload, onDone) {
  const res = await runSafeAction(() => portal.saveFaq(payload, t('adminDashboard.cmsPanel.toasts.faqSaved')));
  if (res.ok && onDone) onDone();
}

async function handleSaveStat(payload, onDone) {
  const res = await runSafeAction(() => portal.saveStat(payload, t('adminDashboard.cmsPanel.toasts.statSaved')));
  if (res.ok && onDone) onDone();
}

async function handleSavePartner(payload, onDone) {
  const res = await runSafeAction(() => portal.savePartner(payload, t('adminDashboard.cmsPanel.toasts.partnerSaved')));
  if (res.ok && onDone) onDone();
}

async function handleSaveFeature(payload, onDone) {
  const res = await runSafeAction(() => portal.saveFeature(payload, t('adminDashboard.cmsPanel.toasts.featureSaved')));
  if (res.ok && onDone) onDone();
}

async function handleUpdateUserRole(user, role, onError) {
  const res = await runSafeAction(() =>
    portal.updateUser(
      user.id,
      { role, isActive: Boolean(user.is_active) },
      user.name + t('adminDashboard.toasts.roleUpdatedSuffix') + role + '.'
    )
  );
  if (!res.ok && onError) {
    onError();
  }
}

async function handleToggleUserActive(user) {
  await runSafeAction(() =>
    portal.updateUser(
      user.id,
      { role: user.role, isActive: !user.is_active },
      t('adminDashboard.toasts.userStatusUpdated')
    )
  );
}

function handleAccountSaved(updatedUser) {
  if (updatedUser?.id && Array.isArray(portal.users.value)) {
    portal.users.value = portal.users.value.map((item) =>
      item.id === updatedUser.id ? { ...item, ...updatedUser } : item
    );
  }
  toast.success(t('adminDashboard.accountModal.savedToast'));
}

async function performLogout() {
  dirtyTabs.value = new Set();
  await auth.logout();
  router.push('/');
}

function handleLogout() {
  if (dirtyTabs.value.size > 0) {
    pendingLogout.value = true;
    unsavedConfirmOpen.value = true;
    return;
  }
  void performLogout();
}

onMounted(() => {
  portal.loadAll().catch(() => {});
});
</script>

<template>
  <AdminShell
    :nav-groups="navGroups"
    :active-tab="activeTab"
    :syncing="portal.syncing.value"
    @select-tab="selectTab"
    @logout="handleLogout"
    @open-account="accountModalOpen = true"
  >
    <StateFeedback
      :loading="portal.loading.value"
      :error="portal.error.value"
      :offline="portal.isOffline.value"
      @retry="() => portal.loadAll().catch(() => {})"
    >
      <AdminOverviewPanel
        v-if="activeTab === 'overview'"
        :stats="portal.overviewStats.value"
        :settings="portal.settings.value"
        :syncing="portal.syncing.value"
        @navigate="selectTab"
        @save-settings="handleSaveSettings"
      />

      <AdminCmsSettingsForm
        v-else-if="activeTab === 'settings'"
        :settings="portal.settings.value"
        :syncing="portal.syncing.value"
        @submit="handleSaveSettings"
      />

      <AdminNewsPanel
        v-else-if="activeTab === 'news'"
        :news="portal.news.value"
        :categories="portal.categories.value"
        :syncing="portal.syncing.value"
        :upload-handler="portal.uploadImage"
        @save-news="handleSaveNews"
        @delete-news="handleDeleteNews"
        @add-category="handleAddCategory"
        @delete-category="handleDeleteNewsCategory"
        @dirty-change="setTabDirty('news', $event)"
      />

      <AdminAgendaPanel
        v-else-if="activeTab === 'agendas'"
        :agendas="portal.agendas.value"
        :syncing="portal.syncing.value"
        :upload-handler="portal.uploadImage"
        @save-agenda="handleSaveAgenda"
        @delete-agenda="handleDeleteAgenda"
        @dirty-change="setTabDirty('agendas', $event)"
      />

      <AdminFaqPanel
        v-else-if="activeTab === 'faqs'"
        :faqs="portal.faqs.value"
        :syncing="portal.syncing.value"
        @save="handleSaveFaq"
        @delete="runSafeAction(() => portal.removeFaq($event, t('adminDashboard.cmsPanel.toasts.faqDeleted')))"
      />

      <AdminStatsPanel
        v-else-if="activeTab === 'stats'"
        :stats="portal.stats.value"
        :syncing="portal.syncing.value"
        @save="handleSaveStat"
        @delete="runSafeAction(() => portal.removeStat($event, t('adminDashboard.cmsPanel.toasts.statDeleted')))"
      />

      <AdminPartnersPanel
        v-else-if="activeTab === 'partners'"
        :partners="portal.partners.value"
        :syncing="portal.syncing.value"
        @save="handleSavePartner"
        @delete="runSafeAction(() => portal.removePartner($event, t('adminDashboard.cmsPanel.toasts.partnerDeleted')))"
      />

      <AdminFeaturesPanel
        v-else-if="activeTab === 'features'"
        :features="portal.features.value"
        :syncing="portal.syncing.value"
        @save="handleSaveFeature"
        @delete="runSafeAction(() => portal.removeFeature($event, t('adminDashboard.cmsPanel.toasts.featureDeleted')))"
      />

      <AdminPortalMenuPanel
        v-else-if="activeTab === 'menus'"
        :settings="portal.settings.value"
        :syncing="portal.syncing.value"
        @save-settings="handleSaveSettings"
      />

      <AdminPortalPagesPanel
        v-else-if="activeTab === 'pages'"
        :settings="portal.settings.value"
        :syncing="portal.syncing.value"
        :upload-handler="portal.uploadImage"
        @save-settings="handleSaveSettings"
      />

      <AdminLecturersPanel
        v-else-if="activeTab === 'lecturers'"
        :lecturers="portal.lecturers.value"
        :syncing="portal.syncing.value"
        :upload-handler="portal.uploadImage"
        @save-lecturer="handleSaveLecturer"
        @delete-lecturer="handleDeleteLecturer"
        @dirty-change="setTabDirty('lecturers', $event)"
      />

      <AdminUsersPanel
        v-else-if="activeTab === 'users'"
        :users="portal.users.value"
        :syncing="portal.syncing.value"
        @update-role="handleUpdateUserRole"
        @toggle-active="handleToggleUserActive"
        @open-account="accountModalOpen = true"
      />
    </StateFeedback>

    <AdminAccountModal
      :open="accountModalOpen"
      @close="accountModalOpen = false"
      @saved="handleAccountSaved"
    />

    <AdminConfirmModal
      :open="unsavedConfirmOpen"
      title="Ada perubahan belum disimpan"
      description="Perubahan yang belum disimpan akan hilang. Lanjutkan?"
      confirm-label="Ya, Buang Perubahan"
      :cancel-label="t('adminDashboard.cancelBtn')"
      @confirm="discardAndContinue"
      @cancel="cancelUnsavedNavigation"
    />
  </AdminShell>
</template>
