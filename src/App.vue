<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AppNavbar from './components/AppNavbar.vue';
import ToastContainer from './components/ToastContainer.vue';
import CookieConsent from './components/CookieConsent.vue';
import { useUiStore } from './stores/ui.store';
import { useLandingStore } from './stores/landing.store.js';

const route = useRoute();
const ui = useUiStore();
const landingStore = useLandingStore();
const hidePublicNav = computed(() => Boolean(route.meta?.hidePublicNav));

onMounted(() => {
  ui.initPreferences();
  if (!landingStore.data && !landingStore.loading) {
    landingStore.fetchLanding().catch(() => {});
  }
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
