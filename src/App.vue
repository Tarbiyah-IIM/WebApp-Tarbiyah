<script setup>
import { onMounted } from 'vue';
import AppNavbar from './components/AppNavbar.vue';
import ToastContainer from './components/ToastContainer.vue';
import CookieConsent from './components/CookieConsent.vue';
import { useUiStore } from './stores/ui.store';

const ui = useUiStore();

onMounted(() => {
  ui.initPreferences();
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-surface-page text-brand-900">
    <AppNavbar />
    <main class="flex-1 pb-24 lg:pb-0">
      <router-view />
    </main>
    <ToastContainer />
    <CookieConsent />
  </div>
</template>
