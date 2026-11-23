<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  BarChart3,
  FileText,
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
import StateFeedback from '../components/StateFeedback.vue';
import AdminShell from '../components/dashboard/AdminShell.vue';
import AdminOverviewPanel from '../components/dashboard/AdminOverviewPanel.vue';
import AdminCmsSettingsForm from '../components/dashboard/AdminCmsSettingsForm.vue';
import AdminNewsPanel from '../components/dashboard/AdminNewsPanel.vue';
import AdminFaqPanel from '../components/dashboard/AdminFaqPanel.vue';
import AdminStatsPanel from '../components/dashboard/AdminStatsPanel.vue';
import AdminPartnersPanel from '../components/dashboard/AdminPartnersPanel.vue';
import AdminFeaturesPanel from '../components/dashboard/AdminFeaturesPanel.vue';
import AdminPortalMenuPanel from '../components/dashboard/AdminPortalMenuPanel.vue';
import AdminPortalPagesPanel from '../components/dashboard/AdminPortalPagesPanel.vue';
import AdminUsersPanel from '../components/dashboard/AdminUsersPanel.vue';

const router = useRouter();
const auth = useAuthStore();
const { t } = useI18n();
const portal = useAdminPortal();
const activeTab = ref('overview');

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
      { id: 'pages', label: t('adminDashboard.nav.pages'), icon: FileText }
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

async function handleSaveSettings(patch, customMessage) {
  await portal.saveSettingsPatch(patch, customMessage || t('adminDashboard.cmsPanel.toasts.settingsSaved'));
}

async function handleSaveNews(payload, onDone) {
  await portal.saveNews(payload, t('adminDashboard.cmsPanel.toasts.newsSaved'));
  if (onDone) onDone();
}

async function handleAddCategory(name, onDone) {
  const created = await portal.addCategory(name, t('adminDashboard.cmsPanel.toasts.categorySaved'));
  if (onDone) onDone(created);
}

async function handleSaveFaq(payload, onDone) {
  await portal.saveFaq(payload, t('adminDashboard.cmsPanel.toasts.faqSaved'));
  if (onDone) onDone();
}

async function handleSaveStat(payload, onDone) {
  await portal.saveStat(payload, t('adminDashboard.cmsPanel.toasts.statSaved'));
  if (onDone) onDone();
}

async function handleSavePartner(payload, onDone) {
  await portal.savePartner(payload, t('adminDashboard.cmsPanel.toasts.partnerSaved'));
  if (onDone) onDone();
}

async function handleSaveFeature(payload, onDone) {
  await portal.saveFeature(payload, t('adminDashboard.cmsPanel.toasts.featureSaved'));
  if (onDone) onDone();
}

async function handleUpdateUserRole(user, role) {
  await portal.updateUser(
    user.id,
    { role, isActive: Boolean(user.is_active) },
    user.name + t('adminDashboard.toasts.roleUpdatedSuffix') + role + '.'
  );
}

async function handleToggleUserActive(user) {
  await portal.updateUser(
    user.id,
    { role: user.role, isActive: !user.is_active },
    t('adminDashboard.toasts.userStatusUpdated')
  );
}

async function handleLogout() {
  await auth.logout();
  router.push('/');
}

onMounted(() => {
  portal.loadAll();
});
</script>

<template>
  <AdminShell
    :nav-groups="navGroups"
    :active-tab="activeTab"
    :syncing="portal.syncing.value"
    @select-tab="activeTab = $event"
    @logout="handleLogout"
  >
    <StateFeedback
      :loading="portal.loading.value"
      :error="portal.error.value"
      :offline="portal.isOffline.value"
      @retry="portal.loadAll"
    >
      <AdminOverviewPanel
        v-if="activeTab === 'overview'"
        :stats="portal.overviewStats.value"
        :settings="portal.settings.value"
        :syncing="portal.syncing.value"
        @navigate="activeTab = $event"
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
        @delete-news="portal.removeNews($event, t('adminDashboard.cmsPanel.toasts.newsDeleted'))"
        @add-category="handleAddCategory"
        @delete-category="portal.removeCategory($event, t('adminDashboard.cmsPanel.toasts.categoryDeleted'))"
      />

      <AdminFaqPanel
        v-else-if="activeTab === 'faqs'"
        :faqs="portal.faqs.value"
        :syncing="portal.syncing.value"
        @save="handleSaveFaq"
        @delete="portal.removeFaq($event, t('adminDashboard.cmsPanel.toasts.faqDeleted'))"
      />

      <AdminStatsPanel
        v-else-if="activeTab === 'stats'"
        :stats="portal.stats.value"
        :syncing="portal.syncing.value"
        @save="handleSaveStat"
        @delete="portal.removeStat($event, t('adminDashboard.cmsPanel.toasts.statDeleted'))"
      />

      <AdminPartnersPanel
        v-else-if="activeTab === 'partners'"
        :partners="portal.partners.value"
        :syncing="portal.syncing.value"
        @save="handleSavePartner"
        @delete="portal.removePartner($event, t('adminDashboard.cmsPanel.toasts.partnerDeleted'))"
      />

      <AdminFeaturesPanel
        v-else-if="activeTab === 'features'"
        :features="portal.features.value"
        :syncing="portal.syncing.value"
        @save="handleSaveFeature"
        @delete="portal.removeFeature($event, t('adminDashboard.cmsPanel.toasts.featureDeleted'))"
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

      <AdminUsersPanel
        v-else-if="activeTab === 'users'"
        :users="portal.users.value"
        :syncing="portal.syncing.value"
        @update-role="handleUpdateUserRole"
        @toggle-active="handleToggleUserActive"
      />
    </StateFeedback>
  </AdminShell>
</template>
