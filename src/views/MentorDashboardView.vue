<script setup>
import { onMounted, ref } from 'vue';
import { Plus, Send, BookOpen, Video, Trash2, Layers } from 'lucide-vue-next';
import { mentorService } from '../services/mentor.service.js';
import { publicService } from '../services/public.service.js';
import { extractApiError } from '../services/api.js';
import { useAsyncState } from '../composables/useAsyncState.js';
import { useFormatters } from '../composables/useFormatters.js';
import { useToast } from '../composables/useToast.js';
import { useI18n } from '../composables/useI18n.js';
import StateFeedback from '../components/StateFeedback.vue';
import ModalDialog from '../components/ModalDialog.vue';

const toast = useToast();
const { t } = useI18n();
const { formatPrice, formatDateTime } = useFormatters();
const { loading, error, isOffline, run } = useAsyncState();

const overview = ref({ mentor: null, stats: {}, courses: [], sessions: [] });
const categories = ref([]);
const courseModalOpen = ref(false);
const curriculumModalOpen = ref(false);
const sessionModalOpen = ref(false);

const activeCourse = ref(null);
const curriculum = ref([]);
const newSectionTitle = ref('');
const lessonForm = ref({ sectionId: '', title: '', videoUrl: '', durationSec: 420, isPreview: false });

const courseForm = ref({
  id: null,
  categoryId: 1,
  title: '',
  subtitle: '',
  description: '',
  level: 'beginner',
  price: 59,
  thumbnailUrl: ''
});

const sessionForm = ref({
  courseId: '',
  title: '',
  description: '',
  startsAt: '',
  durationMin: 60,
  platform: 'zoom',
  meetingUrl: 'https://zoom.us/j/123456789'
});

async function fetchOverview() {
  await run(async () => {
    const [ov, cat] = await Promise.all([
      mentorService.getOverview(),
      publicService.getCategories()
    ]);
    overview.value = ov;
    categories.value = cat.items;
    if (cat.items.length > 0 && !courseForm.value.categoryId) {
      courseForm.value.categoryId = cat.items[0].id;
    }
    if (ov.courses.length > 0 && !sessionForm.value.courseId) {
      sessionForm.value.courseId = ov.courses[0].id;
    }
  });
}

function openCreateCourse() {
  courseForm.value = {
    id: null,
    categoryId: categories.value[0]?.id || 1,
    title: '',
    subtitle: '',
    description: '',
    level: 'beginner',
    price: 59,
    thumbnailUrl: ''
  };
  courseModalOpen.value = true;
}

function openEditCourse(c) {
  courseForm.value = {
    id: c.id,
    categoryId: c.category_id,
    title: c.title,
    subtitle: c.subtitle || '',
    description: c.description,
    level: c.level,
    price: Number(c.price),
    thumbnailUrl: c.thumbnail_url || ''
  };
  courseModalOpen.value = true;
}

async function saveCourse() {
  try {
    if (courseForm.value.id) {
      await mentorService.updateCourse(courseForm.value.id, courseForm.value);
      toast.success(t('mentorDashboard.toasts.updated'));
    } else {
      await mentorService.createCourse(courseForm.value);
      toast.success(t('mentorDashboard.toasts.createdDraft'));
    }
    courseModalOpen.value = false;
    await fetchOverview();
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function submitForReview(courseId) {
  try {
    await mentorService.submitCourseForReview(courseId);
    toast.success(t('mentorDashboard.toasts.submitted'));
    await fetchOverview();
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function openCurriculum(course) {
  activeCourse.value = course;
  curriculumModalOpen.value = true;
  try {
    const res = await mentorService.getCourseCurriculum(course.id);
    curriculum.value = res.curriculum;
    lessonForm.value.sectionId = res.curriculum[0]?.id || '';
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function addSection() {
  if (!newSectionTitle.value.trim() || !activeCourse.value) return;
  try {
    await mentorService.createSection({
      courseId: activeCourse.value.id,
      title: newSectionTitle.value.trim(),
      sortOrder: curriculum.value.length + 1
    });
    newSectionTitle.value = '';
    const res = await mentorService.getCourseCurriculum(activeCourse.value.id);
    curriculum.value = res.curriculum;
    lessonForm.value.sectionId = res.curriculum[res.curriculum.length - 1]?.id || '';
    await fetchOverview();
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function addLesson() {
  if (!lessonForm.value.sectionId || !lessonForm.value.title.trim()) return;
  try {
    await mentorService.createLesson({
      ...lessonForm.value,
      sectionId: Number(lessonForm.value.sectionId),
      durationSec: Number(lessonForm.value.durationSec)
    });
    lessonForm.value.title = '';
    lessonForm.value.videoUrl = '';
    const res = await mentorService.getCourseCurriculum(activeCourse.value.id);
    curriculum.value = res.curriculum;
    await fetchOverview();
    toast.success(t('mentorDashboard.toasts.lessonAdded'));
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function removeLesson(lessonId) {
  try {
    await mentorService.deleteLesson(lessonId);
    const res = await mentorService.getCourseCurriculum(activeCourse.value.id);
    curriculum.value = res.curriculum;
    await fetchOverview();
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function removeSection(sectionId) {
  try {
    await mentorService.deleteSection(sectionId);
    const res = await mentorService.getCourseCurriculum(activeCourse.value.id);
    curriculum.value = res.curriculum;
    lessonForm.value.sectionId = res.curriculum[0]?.id || '';
    await fetchOverview();
    toast.success(t('mentorDashboard.toasts.sectionRemoved'));
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function createSession() {
  try {
    await mentorService.createLiveSession({
      ...sessionForm.value,
      courseId: Number(sessionForm.value.courseId),
      durationMin: Number(sessionForm.value.durationMin)
    });
    sessionModalOpen.value = false;
    await fetchOverview();
    toast.success(t('mentorDashboard.toasts.sessionScheduled'));
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function deleteSession(id) {
  try {
    await mentorService.deleteLiveSession(id);
    await fetchOverview();
    toast.success(t('mentorDashboard.toasts.sessionRemoved'));
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

onMounted(fetchOverview);
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
    <div class="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-brand-900 p-8 text-white">
      <div>
        <p class="text-xs font-bold uppercase tracking-wider text-brand-200">{{ t('mentorDashboard.badge') }}</p>
        <h1 class="mt-1 text-3xl font-extrabold">{{ overview.mentor?.name || t('mentorDashboard.defaultTitle') }}</h1>
        <p class="mt-1 text-sm text-slate-300">{{ overview.mentor?.title }}</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-bold text-white hover:bg-white/20"
          @click="sessionModalOpen = true"
        >
          <Video class="h-4 w-4" />
          {{ t('mentorDashboard.scheduleLiveBtn') }}
        </button>
        <button
          type="button"
          class="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-900 hover:bg-amber-300"
          @click="openCreateCourse"
        >
          <Plus class="h-4 w-4" />
          {{ t('mentorDashboard.newCourseBtn') }}
        </button>
      </div>
    </div>

    <StateFeedback :loading="loading" :error="error" :offline="isOffline" @retry="fetchOverview">
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div class="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
          <p class="text-xs font-bold uppercase text-slate-500">{{ t('mentorDashboard.stats.courses') }}</p>
          <p class="mt-1 text-2xl font-extrabold text-brand-900">{{ overview.stats.totalCourses || 0 }}</p>
        </div>
        <div class="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
          <p class="text-xs font-bold uppercase text-slate-500">{{ t('mentorDashboard.stats.students') }}</p>
          <p class="mt-1 text-2xl font-extrabold text-brand-900">{{ overview.stats.totalStudents || 0 }}</p>
        </div>
        <div class="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
          <p class="text-xs font-bold uppercase text-slate-500">{{ t('mentorDashboard.stats.revenue') }}</p>
          <p class="mt-1 text-2xl font-extrabold text-emerald-600">{{ formatPrice(overview.stats.totalRevenue || 0) }}</p>
        </div>
        <div class="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
          <p class="text-xs font-bold uppercase text-slate-500">{{ t('mentorDashboard.stats.upcoming') }}</p>
          <p class="mt-1 text-2xl font-extrabold text-brand-700">{{ overview.stats.upcomingSessions || 0 }}</p>
        </div>
      </div>

      <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
        <div class="flex items-center gap-2">
          <BookOpen class="h-5 w-5 text-brand-600" />
          <h2 class="text-lg font-extrabold text-brand-900">{{ t('mentorDashboard.tableHeading') }}</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-surface-border text-xs uppercase text-slate-500">
              <tr>
                <th class="py-3 pr-4">{{ t('mentorDashboard.columns.title') }}</th>
                <th class="py-3 pr-4">{{ t('mentorDashboard.columns.price') }}</th>
                <th class="py-3 pr-4">{{ t('mentorDashboard.columns.videos') }}</th>
                <th class="py-3 pr-4">{{ t('mentorDashboard.columns.students') }}</th>
                <th class="py-3 pr-4">{{ t('mentorDashboard.columns.status') }}</th>
                <th class="py-3 text-right">{{ t('mentorDashboard.columns.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-border">
              <tr v-for="c in overview.courses" :key="c.id">
                <td class="py-3.5 pr-4 font-bold text-brand-900">{{ c.title }}</td>
                <td class="py-3.5 pr-4">{{ formatPrice(c.price, c.currency) }}</td>
                <td class="py-3.5 pr-4">{{ c.total_videos }}</td>
                <td class="py-3.5 pr-4">{{ c.student_count }}</td>
                <td class="py-3.5 pr-4">
                  <span
                    class="rounded-full px-3 py-1 text-xs font-bold uppercase"
                    :class="{
                      'bg-emerald-100 text-emerald-800': c.approval_status === 'approved' && c.is_published,
                      'bg-amber-100 text-amber-800': c.approval_status === 'pending_review',
                      'bg-slate-100 text-slate-700': c.approval_status === 'draft',
                      'bg-rose-100 text-rose-800': c.approval_status === 'rejected'
                    }"
                  >
                    {{ c.approval_status }}
                  </span>
                </td>
                <td class="py-3.5 text-right space-x-2 whitespace-nowrap">
                  <button type="button" class="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold hover:bg-brand-50" @click="openEditCourse(c)">
                    {{ t('mentorDashboard.editBtn') }}
                  </button>
                  <button type="button" class="inline-flex items-center gap-1 rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold hover:bg-brand-50" @click="openCurriculum(c)">
                    <Layers class="h-3.5 w-3.5" />
                    {{ t('mentorDashboard.curriculumBtn') }}
                  </button>
                  <button
                    v-if="c.approval_status === 'draft' || c.approval_status === 'rejected'"
                    type="button"
                    class="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700"
                    @click="submitForReview(c.id)"
                  >
                    <Send class="h-3.5 w-3.5" />
                    {{ t('mentorDashboard.submitBtn') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
        <h2 class="text-lg font-extrabold text-brand-900">{{ t('mentorDashboard.sessionsHeading') }}</h2>
        <p v-if="overview.sessions.length === 0" class="text-sm text-slate-500">{{ t('mentorDashboard.noSessions') }}</p>
        <div v-else class="space-y-3">
          <div
            v-for="s in overview.sessions"
            :key="s.id"
            class="flex items-center justify-between gap-4 rounded-xl border border-surface-border bg-surface-page p-4"
          >
            <div>
              <p class="font-bold text-brand-900">{{ s.title }}</p>
              <p class="text-xs text-slate-500">{{ s.course_title }} · {{ formatDateTime(s.starts_at) }} · {{ s.registered_count }} {{ t('mentorDashboard.registeredSuffix') }}</p>
            </div>
            <button type="button" class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" @click="deleteSession(s.id)">
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </StateFeedback>

    <ModalDialog :open="courseModalOpen" :title="courseForm.id ? t('mentorDashboard.modalEditCourse') : t('mentorDashboard.modalCreateCourse')" @close="courseModalOpen = false">
      <form class="space-y-4" @submit.prevent="saveCourse">
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">{{ t('mentorDashboard.fields.courseTitle') }}</label>
          <input v-model="courseForm.title" type="text" required class="min-h-[44px] w-full rounded-xl border border-surface-border px-3 text-sm" />
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">{{ t('mentorDashboard.fields.category') }}</label>
            <select v-model="courseForm.categoryId" class="min-h-[44px] w-full rounded-xl border border-surface-border px-3 text-sm">
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">{{ t('mentorDashboard.fields.level') }}</label>
            <select v-model="courseForm.level" class="min-h-[44px] w-full rounded-xl border border-surface-border px-3 text-sm">
              <option value="beginner">{{ t('catalog.levels.beginner') }}</option>
              <option value="intermediate">{{ t('catalog.levels.intermediate') }}</option>
              <option value="advanced">{{ t('catalog.levels.advanced') }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">{{ t('mentorDashboard.fields.price') }}</label>
            <input v-model="courseForm.price" type="number" min="0" step="0.01" required class="min-h-[44px] w-full rounded-xl border border-surface-border px-3 text-sm" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">{{ t('mentorDashboard.fields.subtitle') }}</label>
          <input v-model="courseForm.subtitle" type="text" class="min-h-[44px] w-full rounded-xl border border-surface-border px-3 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">{{ t('mentorDashboard.fields.description') }}</label>
          <textarea v-model="courseForm.description" rows="4" required minlength="10" class="w-full rounded-xl border border-surface-border p-3 text-sm" />
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" class="min-h-[42px] rounded-xl border border-surface-border px-4 text-sm font-semibold" @click="courseModalOpen = false">{{ t('mentorDashboard.cancelBtn') }}</button>
          <button type="submit" class="min-h-[42px] rounded-xl bg-brand-600 px-5 text-sm font-bold text-white">{{ t('mentorDashboard.saveCourseBtn') }}</button>
        </div>
      </form>
    </ModalDialog>

    <ModalDialog :open="curriculumModalOpen" :title="t('mentorDashboard.curriculumTitlePrefix') + (activeCourse?.title || '')" @close="curriculumModalOpen = false">
      <div class="space-y-5">
        <form class="flex gap-2" @submit.prevent="addSection">
          <input v-model="newSectionTitle" type="text" required :placeholder="t('mentorDashboard.newSectionPlaceholder')" class="min-h-[42px] flex-1 rounded-xl border border-surface-border px-3 text-sm" />
          <button type="submit" class="rounded-xl bg-brand-600 px-4 text-xs font-bold text-white">{{ t('mentorDashboard.addSectionBtn') }}</button>
        </form>

        <form v-if="curriculum.length > 0" class="rounded-xl border border-surface-border bg-surface-page p-4 space-y-3" @submit.prevent="addLesson">
          <p class="text-xs font-bold uppercase text-slate-500">{{ t('mentorDashboard.addLessonHeading') }}</p>
          <select v-model="lessonForm.sectionId" class="min-h-[40px] w-full rounded-xl border border-surface-border bg-white px-3 text-sm">
            <option v-for="sec in curriculum" :key="sec.id" :value="sec.id">{{ sec.title }}</option>
          </select>
          <input v-model="lessonForm.title" type="text" required :placeholder="t('mentorDashboard.lessonTitlePlaceholder')" class="min-h-[40px] w-full rounded-xl border border-surface-border bg-white px-3 text-sm" />
          <input v-model="lessonForm.videoUrl" type="url" required :placeholder="t('mentorDashboard.videoUrlPlaceholder')" class="min-h-[40px] w-full rounded-xl border border-surface-border bg-white px-3 text-sm" />
          <div class="flex items-center justify-between gap-3">
            <input v-model="lessonForm.durationSec" type="number" min="0" :placeholder="t('mentorDashboard.durationPlaceholder')" class="min-h-[40px] w-36 rounded-xl border border-surface-border bg-white px-3 text-sm" />
            <label class="inline-flex items-center gap-2 text-xs font-semibold">
              <input v-model="lessonForm.isPreview" type="checkbox" />
              {{ t('mentorDashboard.freePreviewLabel') }}
            </label>
            <button type="submit" class="min-h-[40px] rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white">{{ t('mentorDashboard.addLessonBtn') }}</button>
          </div>
        </form>

        <div v-for="sec in curriculum" :key="sec.id" class="rounded-xl border border-surface-border p-3 space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-sm font-bold text-brand-900">{{ sec.title }}</p>
            <button type="button" class="text-xs text-rose-600 hover:underline" @click="removeSection(sec.id)">{{ t('mentorDashboard.deleteSectionBtn') }}</button>
          </div>
          <div v-for="les in sec.lessons" :key="les.id" class="flex items-center justify-between text-xs bg-surface-page px-3 py-2 rounded-lg">
            <span>{{ les.title }}</span>
            <button type="button" class="text-rose-600 hover:underline" @click="removeLesson(les.id)">{{ t('mentorDashboard.removeLessonBtn') }}</button>
          </div>
        </div>
      </div>
    </ModalDialog>

    <ModalDialog :open="sessionModalOpen" :title="t('mentorDashboard.scheduleModalTitle')" @close="sessionModalOpen = false">
      <form class="space-y-4" @submit.prevent="createSession">
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">{{ t('mentorDashboard.fields.course') }}</label>
          <select v-model="sessionForm.courseId" required class="min-h-[44px] w-full rounded-xl border border-surface-border px-3 text-sm">
            <option v-for="c in overview.courses" :key="c.id" :value="c.id">{{ c.title }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">{{ t('mentorDashboard.fields.sessionTitle') }}</label>
          <input v-model="sessionForm.title" type="text" required class="min-h-[44px] w-full rounded-xl border border-surface-border px-3 text-sm" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">{{ t('mentorDashboard.fields.startsAt') }}</label>
            <input v-model="sessionForm.startsAt" type="datetime-local" required class="min-h-[44px] w-full rounded-xl border border-surface-border px-3 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">{{ t('mentorDashboard.fields.platform') }}</label>
            <select v-model="sessionForm.platform" class="min-h-[44px] w-full rounded-xl border border-surface-border px-3 text-sm">
              <option value="zoom">Zoom</option>
              <option value="google_meet">Google Meet</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">{{ t('mentorDashboard.fields.meetingUrl') }}</label>
          <input v-model="sessionForm.meetingUrl" type="url" required class="min-h-[44px] w-full rounded-xl border border-surface-border px-3 text-sm" />
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" class="min-h-[42px] rounded-xl border border-surface-border px-4 text-sm font-semibold" @click="sessionModalOpen = false">{{ t('mentorDashboard.cancelBtn') }}</button>
          <button type="submit" class="min-h-[42px] rounded-xl bg-brand-600 px-5 text-sm font-bold text-white">{{ t('mentorDashboard.publishSessionBtn') }}</button>
        </div>
      </form>
    </ModalDialog>
  </div>
</template>
