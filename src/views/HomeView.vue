<script setup>
import { onMounted } from 'vue';
import { useLandingStore } from '../stores/landing.store.js';
import { useAsyncState } from '../composables/useAsyncState.js';
import StateFeedback from '../components/StateFeedback.vue';
import HeroSection from '../components/HeroSection.vue';
import StatsStrip from '../components/StatsStrip.vue';
import CoursesSection from '../components/CoursesSection.vue';
import FeaturesSection from '../components/FeaturesSection.vue';
import JourneySection from '../components/JourneySection.vue';
import PartnersGrid from '../components/PartnersGrid.vue';
import TestimonialsSection from '../components/TestimonialsSection.vue';
import FaqAccordion from '../components/FaqAccordion.vue';
import FooterSection from '../components/FooterSection.vue';

const landingStore = useLandingStore();
const { loading, error, isOffline, run } = useAsyncState();

async function loadLanding() {
  await run(() => landingStore.fetchLanding(true));
}

onMounted(() => {
  loadLanding();
});
</script>

<template>
  <div>
    <StateFeedback
      v-if="!landingStore.data && (loading || error)"
      :loading="loading"
      :error="error"
      :offline="isOffline"
      @retry="loadLanding"
    />

    <template v-else-if="landingStore.data">
      <HeroSection :settings="landingStore.data.settings" />
      <StatsStrip :stats="landingStore.data.stats.hero" />
      <CoursesSection />
      <FeaturesSection :features="landingStore.data.features" />
      <JourneySection :stats="landingStore.data.stats.journey" />
      <PartnersGrid :partners="landingStore.data.partners" />
      <TestimonialsSection :testimonials="landingStore.data.testimonials" />
      <FaqAccordion :faqs="landingStore.data.faqs" />
      <FooterSection :settings="landingStore.data.settings" />
    </template>
  </div>
</template>
