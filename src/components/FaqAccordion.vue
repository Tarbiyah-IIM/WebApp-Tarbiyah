<script setup>
import { ref } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

const props = defineProps({
  faqs: { type: Array, default: () => [] }
});

const openId = ref(null);

function toggle(id) {
  openId.value = openId.value === id ? null : id;
}
</script>

<template>
  <section id="faq" class="bg-white py-16 sm:py-20">
    <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <span class="rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
          FAQ
        </span>
        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <p class="mt-2 text-base text-slate-600">
          Clear answers on course access, requirements, enrollment, and refund guarantees.
        </p>
      </div>

      <div class="mt-10 space-y-3">
        <div
          v-for="faq in props.faqs"
          :key="faq.id"
          class="overflow-hidden rounded-2xl border border-surface-border bg-surface-page transition"
        >
          <button
            type="button"
            class="flex min-h-[56px] w-full items-center justify-between gap-4 px-6 py-4 text-left text-base font-bold text-brand-900 hover:bg-brand-50/60 transition"
            :aria-expanded="openId === faq.id"
            :aria-controls="`faq-panel-${faq.id}`"
            @click="toggle(faq.id)"
          >
            <span>{{ faq.question }}</span>
            <ChevronDown
              class="h-5 w-5 shrink-0 text-brand-600 transition-transform duration-200"
              :class="{ 'rotate-180': openId === faq.id }"
            />
          </button>
          <div
            v-show="openId === faq.id"
            :id="`faq-panel-${faq.id}`"
            class="border-t border-surface-border bg-white px-6 py-4 text-sm leading-relaxed text-slate-600"
          >
            {{ faq.answer }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
