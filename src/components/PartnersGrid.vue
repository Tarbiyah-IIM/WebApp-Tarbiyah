<script setup>
defineProps({
  partners: { type: Array, default: () => [] }
});
</script>

<template>
  <section class="border-y border-surface-border bg-white py-14">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <p class="text-center text-xs font-bold uppercase tracking-widest text-slate-500">
        Our Trusted Partners & Collaboration Ecosystem
      </p>
      <div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
        <a
          v-for="partner in partners"
          :key="partner.id"
          :href="partner.url || '#'"
          target="_blank"
          rel="noopener noreferrer"
          class="flex min-h-[56px] items-center justify-center rounded-xl border border-surface-border bg-surface-page px-3 py-2.5 text-center text-sm font-bold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
        >
          <img
            v-if="partner.logo_url"
            :src="partner.logo_url"
            :alt="partner.name"
            loading="lazy"
            class="h-6 max-w-full object-contain"
          />
          <span v-else>{{ partner.name }}</span>
        </a>
      </div>
    </div>
  </section>
</template>
