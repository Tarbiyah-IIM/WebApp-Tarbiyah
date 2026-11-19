<script setup>
import { computed, ref, watch } from 'vue';
import { Award, ChevronDown } from 'lucide-vue-next';
import ModalDialog from './ModalDialog.vue';
import { useI18n } from '../composables/useI18n.js';

const props = defineProps({
  open: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);

const { t } = useI18n();

const scholarshipData = computed(() => t('hero.scholarships') || { modalTitle: '', labels: {}, items: [] });
const items = computed(() => scholarshipData.value.items || []);
const labels = computed(() => scholarshipData.value.labels || {});

const expandedId = ref('prestasi-akademik');

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      expandedId.value = items.value[0]?.id || null;
    }
  }
);

function toggleItem(id) {
  expandedId.value = expandedId.value === id ? null : id;
}
</script>

<template>
  <ModalDialog
    :open="open"
    :title="scholarshipData.modalTitle || t('hero.scholarshipTitle')"
    header-variant="macos"
    @close="emit('close')"
  >
    <div class="space-y-3" data-testid="scholarship-list">
      <div
        v-for="(item, idx) in items"
        :key="item.id"
        class="overflow-hidden rounded-2xl border border-surface-border bg-surface-page transition"
      >
        <button
          type="button"
          :aria-expanded="expandedId === item.id"
          class="flex min-h-[52px] w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-brand-50"
          @click="toggleItem(item.id)"
        >
          <div class="flex min-w-0 items-center gap-3">
            <span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-extrabold text-white">
              {{ idx + 1 }}
            </span>
            <span class="text-sm font-extrabold text-brand-900 sm:text-base">
              {{ item.title }}
            </span>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <span
              class="hidden rounded-full px-2.5 py-0.5 text-[11px] font-bold sm:inline-flex items-center gap-1"
              :class="item.sourceType === 'external' ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-50 text-brand-700'"
            >
              <Award class="h-3 w-3" aria-hidden="true" />
              <span>{{ item.source }}</span>
            </span>
            <ChevronDown
              class="h-4 w-4 text-slate-500 transition-transform duration-150"
              :class="{ 'rotate-180 text-brand-600': expandedId === item.id }"
              aria-hidden="true"
            />
          </div>
        </button>

        <div
          v-if="expandedId === item.id"
          class="space-y-4 border-t border-surface-border bg-white p-4 sm:p-5 text-sm leading-relaxed text-slate-700"
        >
          <p>
            <template v-for="(seg, segIdx) in item.descriptionSegments" :key="segIdx">
              <strong v-if="seg.bold" class="font-bold text-brand-900">{{ seg.text }}</strong>
              <span v-else>{{ seg.text }}</span>
            </template>
          </p>

          <ul v-if="item.bullets?.length" class="list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li v-for="bullet in item.bullets" :key="bullet">{{ bullet }}</li>
          </ul>

          <p v-if="item.footnote" class="text-sm text-slate-700">
            {{ item.footnote }}
          </p>

          <div class="grid grid-cols-1 gap-3 rounded-xl border border-surface-border bg-surface-page p-3.5 sm:grid-cols-2 lg:grid-cols-4">
            <div class="space-y-0.5">
              <p class="text-xs font-extrabold text-brand-900">{{ labels.level }}</p>
              <p class="text-xs leading-relaxed text-slate-700">{{ item.level }}</p>
            </div>
            <div class="space-y-0.5">
              <p class="text-xs font-extrabold text-brand-900">{{ labels.source }}</p>
              <p class="text-xs leading-relaxed text-slate-700">{{ item.source }}</p>
            </div>
            <div class="space-y-0.5">
              <p class="text-xs font-extrabold text-brand-900">{{ labels.destination }}</p>
              <ul v-if="item.destinationBullets?.length" class="list-disc space-y-0.5 pl-4 text-xs leading-relaxed text-slate-700">
                <li v-for="dest in item.destinationBullets" :key="dest">{{ dest }}</li>
              </ul>
              <div v-else class="space-y-0.5 text-xs leading-relaxed text-slate-700">
                <p v-for="line in item.destinationLines" :key="line">{{ line }}</p>
              </div>
            </div>
            <div class="space-y-0.5">
              <p class="text-xs font-extrabold text-brand-900">{{ labels.target }}</p>
              <p class="text-xs leading-relaxed text-slate-700">{{ item.target }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ModalDialog>
</template>
