<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import AppNavbar from './components/AppNavbar.vue';
import ToastContainer from './components/ToastContainer.vue';
import CookieConsent from './components/CookieConsent.vue';
import { useUiStore } from './stores/ui.store';
import { useLandingStore } from './stores/landing.store.js';
import { useAuthStore } from './stores/auth.store.js';

const route = useRoute();
const ui = useUiStore();
const landingStore = useLandingStore();
const auth = useAuthStore();
const hidePublicNav = computed(() => Boolean(route.meta?.hidePublicNav));

let stopLogoutSync = () => {};
let stopLandingSync = () => {};

onMounted(() => {
  ui.initPreferences();
  if (!landingStore.data && !landingStore.loading) {
    landingStore.fetchLanding().catch(() => {});
  }
  stopLogoutSync = auth.syncLogoutAcrossTabs();
  stopLandingSync = landingStore.listenForLandingUpdates();
});

onUnmounted(() => {
  stopLogoutSync();
  stopLandingSync();
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-surface-page text-brand-900">
    <AppNavbar v-if="!hidePublicNav" />
    <main class="flex-1" :class="hidePublicNav ? '' : 'pb-24 lg:pb-0'">
      <router-view />
    </main>
    <ToastContainer />
    <CookieConsent v-if="!hidePublicNav" />
  </div>
</template>
