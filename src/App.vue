<script setup>
import AppNavbar from './components/AppNavbar.vue';
import ToastContainer from './components/ToastContainer.vue';
import CookieConsent from './components/CookieConsent.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col bg-surface-page text-brand-900">
    <AppNavbar />
    <main class="flex-1">
      <router-view />
    </main>
    <ToastContainer />
    <CookieConsent />
  </div>
</template>
