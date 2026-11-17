<script setup>
import { onMounted, ref } from 'vue';
import { ArrowUp, ArrowDown, Compass, Trash2, CheckCircle2 } from 'lucide-vue-next';
import { studentService } from '../../services/student.service.js';
import { publicService } from '../../services/public.service.js';
import { extractApiError } from '../../services/api.js';
import { useToast } from '../../composables/useToast.js';

const toast = useToast();

const paths = ref([]);
const categories = ref([]);
const goalTitle = ref('');
const categoryId = ref('');
const targetLevel = ref('beginner');
const loading = ref(false);

async function loadData() {
  loading.value = true;
  try {
    const [pRes, cRes] = await Promise.all([
      studentService.getLearningPaths(),
      publicService.getCategories()
    ]);
    paths.value = pRes.items;
    categories.value = cRes.items;
  } catch (err) {
    toast.error(extractApiError(err));
  } finally {
    loading.value = false;
  }
}

async function handleGenerate() {
  if (!goalTitle.value.trim()) return;
  loading.value = true;
  try {
    const res = await studentService.generateLearningPath({
      goalTitle: goalTitle.value.trim(),
      categoryId: categoryId.value ? Number(categoryId.value) : null,
      targetLevel: targetLevel.value
    });
    paths.value = res.items;
    goalTitle.value = '';
    toast.success('Personalized learning path generated!');
  } catch (err) {
    toast.error(extractApiError(err));
  } finally {
    loading.value = false;
  }
}

async function moveItem(path, idx, delta) {
  const targetIdx = idx + delta;
  if (targetIdx < 0 || targetIdx >= path.items.length) return;
  const copy = [...path.items];
  const [moved] = copy.splice(idx, 1);
  copy.splice(targetIdx, 0, moved);
  const orderedItemIds = copy.map((i) => i.id);
  try {
    const res = await studentService.reorderLearningPath(path.id, orderedItemIds);
    paths.value = res.items;
    toast.success('Learning path order updated.');
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function deletePath(pathId) {
  try {
    await studentService.deleteLearningPath(pathId);
    paths.value = paths.value.filter((p) => p.id !== pathId);
    toast.success('Learning path removed.');
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

onMounted(loadData);
</script>

<template>
  <div class="space-y-6">
    <form
      class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4"
      @submit.prevent="handleGenerate"
    >
      <div class="flex items-center gap-2 text-brand-700">
        <Compass class="h-5 w-5" />
        <h2 class="text-lg font-extrabold text-brand-900">Build Your Personalized Learning Path</h2>
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-12">
        <input
          v-model="goalTitle"
          type="text"
          required
          placeholder="Your career goal (e.g. Become Fullstack Engineer)"
          class="min-h-[44px] rounded-xl border border-surface-border px-4 text-sm sm:col-span-5"
        />
        <select
          v-model="categoryId"
          class="min-h-[44px] rounded-xl border border-surface-border px-3 text-sm sm:col-span-3"
        >
          <option value="">Any Category</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <select
          v-model="targetLevel"
          class="min-h-[44px] rounded-xl border border-surface-border px-3 text-sm sm:col-span-2"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <button
          type="submit"
          :disabled="loading"
          class="min-h-[44px] rounded-xl bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700 sm:col-span-2"
        >
          Generate
        </button>
      </div>
    </form>

    <div v-if="paths.length === 0 && !loading" class="rounded-2xl border border-surface-border bg-white p-8 text-center text-sm text-slate-500">
      No learning paths yet. Fill the goal form above to generate a custom roadmap.
    </div>

    <div
      v-for="path in paths"
      :key="path.id"
      class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4"
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-extrabold text-brand-900">{{ path.goal_title }}</h3>
          <p class="text-xs text-slate-500">
            {{ path.category_name || 'Cross-Discipline' }} · Level: {{ path.target_level }}
          </p>
        </div>
        <button
          type="button"
          class="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          aria-label="Delete path"
          @click="deletePath(path.id)"
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </div>

      <ol class="space-y-2.5">
        <li
          v-for="(item, idx) in path.items"
          :key="item.id"
          class="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-page p-3.5"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              {{ idx + 1 }}
            </span>
            <div class="min-w-0">
              <router-link :to="`/courses/${item.slug}`" class="truncate block text-sm font-bold text-brand-900 hover:text-brand-600">
                {{ item.title }}
              </router-link>
              <span class="text-xs text-slate-500">
                {{ item.level }} · {{ item.duration_hours }} hrs · Progress: {{ Number(item.progress_pct).toFixed(0) }}%
              </span>
            </div>
          </div>

          <div class="flex items-center gap-1 shrink-0">
            <CheckCircle2 v-if="item.is_completed" class="h-4 w-4 text-emerald-600 mr-1" />
            <button
              type="button"
              :disabled="idx === 0"
              class="rounded-lg border border-surface-border bg-white p-1.5 text-slate-600 hover:bg-brand-50 disabled:opacity-30"
              aria-label="Move up"
              @click="moveItem(path, idx, -1)"
            >
              <ArrowUp class="h-4 w-4" />
            </button>
            <button
              type="button"
              :disabled="idx === path.items.length - 1"
              class="rounded-lg border border-surface-border bg-white p-1.5 text-slate-600 hover:bg-brand-50 disabled:opacity-30"
              aria-label="Move down"
              @click="moveItem(path, idx, 1)"
            >
              <ArrowDown class="h-4 w-4" />
            </button>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>
