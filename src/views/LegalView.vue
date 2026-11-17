<script setup>
defineProps({
  type: { type: String, default: 'terms' }
});
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="rounded-3xl border border-surface-border bg-white p-8 shadow-card space-y-6">
      <h1 class="text-3xl font-extrabold text-brand-900">
        {{ type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions' }}
      </h1>
      <p class="text-sm text-slate-600 leading-relaxed">
        {{
          type === 'privacy'
            ? 'Meekoo collects only essential account, course progress, and order records required to deliver your learning experience. Payment card credentials are never stored on Meekoo servers. You may delete your account and associated personal records directly from your Student Dashboard profile settings at any time.'
            : 'By enrolling in individual courses or activating the Meekoo Premium Annual membership, you receive a non-transferable license to stream course materials, participate in live sessions, and engage in course community discussions in accordance with our community standards. Individual course purchases are backed by a 14-day refund policy when under 25% completion.'
        }}
      </p>
      <router-link
        to="/"
        class="inline-flex min-h-[44px] items-center rounded-xl bg-brand-600 px-5 text-sm font-bold text-white"
      >
        Back to Home
      </router-link>
    </div>
  </div>
</template>
