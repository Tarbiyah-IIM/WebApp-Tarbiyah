<script setup>
import { onMounted, ref } from 'vue';
import { Plus, Trash2, Upload, Layers, CheckCircle2 } from 'lucide-vue-next';
import { adminService } from '../../services/admin.service.js';
import { extractApiError } from '../../services/api.js';
import { useLandingStore } from '../../stores/landing.store.js';
import { useFormatters } from '../../composables/useFormatters.js';
import { useToast } from '../../composables/useToast.js';
import ModalDialog from '../ModalDialog.vue';

const landingStore = useLandingStore();
const toast = useToast();
const { formatPrice } = useFormatters();

const courses = ref([]);
const categories = ref([]);
const mentors = ref([]);

const courseModalOpen = ref(false);
const curriculumModalOpen = ref(false);
const activeCourse = ref(null);
const curriculum = ref([]);
const newSectionTitle = ref('');
const lessonForm = ref({ sectionId: '', title: '', videoUrl: '', durationSec: 420, isPreview: false });

const courseForm = ref({
  id: null,
  categoryId: 1,
  mentorId: 1,
  title: '',
  subtitle: '',
  description: '',
  level: 'beginner',
  price: 59,
  badge: '',
  thumbnailUrl: '',
  approvalStatus: 'approved',
  isPublished: true
});

const categoryForm = ref({ id: null, name: '', slug: '', sortOrder: 0 });
const mentorForm = ref({ id: null, name: '', title: '', bio: '', photoUrl: '', sortOrder: 0, isActive: true });

async function loadAll() {
  try {
    const [cRes, catRes, mRes] = await Promise.all([
      adminService.listCourses(),
      adminService.listCategories(),
      adminService.listMentors()
    ]);
    courses.value = cRes.items;
    categories.value = catRes.items;
    mentors.value = mRes.items;
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

function openNewCourse() {
  courseForm.value = {
    id: null,
    categoryId: categories.value[0]?.id || 1,
    mentorId: mentors.value[0]?.id || 1,
    title: '',
    subtitle: '',
    description: '',
    level: 'beginner',
    price: 59,
    badge: '',
    thumbnailUrl: '',
    approvalStatus: 'approved',
    isPublished: true
  };
  courseModalOpen.value = true;
}

function openEditCourse(c) {
  courseForm.value = {
    id: c.id,
    categoryId: c.category_id,
    mentorId: c.mentor_id,
    title: c.title,
    subtitle: c.subtitle || '',
    description: c.description,
    level: c.level,
    price: Number(c.price),
    badge: c.badge || '',
    thumbnailUrl: c.thumbnail_url || '',
    approvalStatus: c.approval_status,
    isPublished: Boolean(c.is_published)
  };
  courseModalOpen.value = true;
}

async function handleImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const res = await adminService.uploadImage(file);
    courseForm.value.thumbnailUrl = res.url;
    toast.success('Thumbnail uploaded.');
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function saveCourse() {
  try {
    const payload = {
      ...courseForm.value,
      badge: courseForm.value.badge || null,
      thumbnailUrl: courseForm.value.thumbnailUrl || null
    };
    if (courseForm.value.id) {
      await adminService.updateCourse(courseForm.value.id, payload);
      toast.success('Course updated & synced.');
    } else {
      await adminService.createCourse(payload);
      toast.success('Course created & synced.');
    }
    courseModalOpen.value = false;
    await Promise.all([loadAll(), landingStore.fetchLanding(true)]);
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function approveAndPublish(c) {
  try {
    await adminService.updateCourse(c.id, {
      categoryId: c.category_id,
      mentorId: c.mentor_id,
      title: c.title,
      subtitle: c.subtitle || '',
      description: c.description,
      level: c.level,
      price: Number(c.price),
      badge: c.badge || null,
      thumbnailUrl: c.thumbnail_url || null,
      approvalStatus: 'approved',
      isPublished: true
    });
    toast.success(`"${c.title}" approved & published to catalog.`);
    await Promise.all([loadAll(), landingStore.fetchLanding(true)]);
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function removeCourse(id) {
  try {
    await adminService.deleteCourse(id);
    await Promise.all([loadAll(), landingStore.fetchLanding(true)]);
    toast.success('Course deleted.');
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function openCurriculum(c) {
  activeCourse.value = c;
  curriculumModalOpen.value = true;
  const res = await adminService.getCourseCurriculum(c.id);
  curriculum.value = res.curriculum;
  lessonForm.value.sectionId = res.curriculum[0]?.id || '';
}

async function addSection() {
  if (!newSectionTitle.value.trim() || !activeCourse.value) return;
  await adminService.createSection({
    courseId: activeCourse.value.id,
    title: newSectionTitle.value.trim(),
    sortOrder: curriculum.value.length + 1
  });
  newSectionTitle.value = '';
  const res = await adminService.getCourseCurriculum(activeCourse.value.id);
  curriculum.value = res.curriculum;
  lessonForm.value.sectionId = res.curriculum[res.curriculum.length - 1]?.id || '';
}

async function addLesson() {
  if (!lessonForm.value.sectionId || !lessonForm.value.title.trim()) return;
  await adminService.createLesson({
    ...lessonForm.value,
    sectionId: Number(lessonForm.value.sectionId),
    durationSec: Number(lessonForm.value.durationSec)
  });
  lessonForm.value.title = '';
  lessonForm.value.videoUrl = '';
  const res = await adminService.getCourseCurriculum(activeCourse.value.id);
  curriculum.value = res.curriculum;
  await loadAll();
  toast.success('Lesson added.');
}

async function removeLesson(id) {
  await adminService.deleteLesson(id);
  const res = await adminService.getCourseCurriculum(activeCourse.value.id);
  curriculum.value = res.curriculum;
  await loadAll();
}

async function removeSection(id) {
  await adminService.deleteSection(id);
  const res = await adminService.getCourseCurriculum(activeCourse.value.id);
  curriculum.value = res.curriculum;
  lessonForm.value.sectionId = res.curriculum[0]?.id || '';
  await loadAll();
  toast.success('Section deleted.');
}

async function saveCategory() {
  try {
    if (categoryForm.value.id) {
      await adminService.updateCategory(categoryForm.value.id, categoryForm.value);
    } else {
      await adminService.createCategory(categoryForm.value);
    }
    categoryForm.value = { id: null, name: '', slug: '', sortOrder: 0 };
    await Promise.all([loadAll(), landingStore.fetchLanding(true)]);
    toast.success('Category saved & synced.');
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function removeCategory(id) {
  try {
    await adminService.deleteCategory(id);
    await Promise.all([loadAll(), landingStore.fetchLanding(true)]);
    toast.success('Category deleted.');
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function saveMentor() {
  try {
    if (mentorForm.value.id) {
      await adminService.updateMentor(mentorForm.value.id, mentorForm.value);
    } else {
      await adminService.createMentor(mentorForm.value);
    }
    mentorForm.value = { id: null, name: '', title: '', bio: '', photoUrl: '', sortOrder: 0, isActive: true };
    await Promise.all([loadAll(), landingStore.fetchLanding(true)]);
    toast.success('Mentor saved & synced.');
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function removeMentor(id) {
  try {
    await adminService.deleteMentor(id);
    await Promise.all([loadAll(), landingStore.fetchLanding(true)]);
    toast.success('Mentor removed.');
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

onMounted(loadAll);
</script>

<template>
  <div class="space-y-8">
    <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h2 class="text-lg font-extrabold text-brand-900">Courses & Mentor Approvals</h2>
        <button
          type="button"
          class="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-xs font-bold text-white hover:bg-brand-700"
          @click="openNewCourse"
        >
          <Plus class="h-4 w-4" />
          Add Course
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-surface-border text-xs uppercase text-slate-500">
            <tr>
              <th class="py-3 pr-4">Course</th>
              <th class="py-3 pr-4">Mentor</th>
              <th class="py-3 pr-4">Price</th>
              <th class="py-3 pr-4">Status</th>
              <th class="py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-border">
            <tr v-for="c in courses" :key="c.id">
              <td class="py-3 pr-4">
                <p class="font-bold text-brand-900">{{ c.title }}</p>
                <p class="text-xs text-slate-500">{{ c.category_name }} · {{ c.total_videos }} videos</p>
              </td>
              <td class="py-3 pr-4 text-xs">{{ c.mentor_name }}</td>
              <td class="py-3 pr-4 font-bold">{{ formatPrice(c.price, c.currency) }}</td>
              <td class="py-3 pr-4">
                <span
                  class="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase"
                  :class="c.is_published && c.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                >
                  {{ c.approval_status }} · {{ c.is_published ? 'Live' : 'Hidden' }}
                </span>
              </td>
              <td class="py-3 text-right space-x-1.5 whitespace-nowrap">
                <button
                  v-if="!c.is_published || c.approval_status !== 'approved'"
                  type="button"
                  class="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white"
                  @click="approveAndPublish(c)"
                >
                  <CheckCircle2 class="h-3.5 w-3.5" />
                  Approve
                </button>
                <button type="button" class="rounded-lg border border-surface-border px-2.5 py-1 text-xs font-semibold" @click="openEditCourse(c)">
                  Edit
                </button>
                <button type="button" class="inline-flex items-center gap-1 rounded-lg border border-surface-border px-2.5 py-1 text-xs font-semibold" @click="openCurriculum(c)">
                  <Layers class="h-3.5 w-3.5" />
                  Syllabus
                </button>
                <button type="button" class="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50" @click="removeCourse(c.id)">
                  <Trash2 class="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
        <h2 class="text-lg font-extrabold text-brand-900">Categories</h2>
        <form class="grid grid-cols-1 gap-2 sm:grid-cols-3" @submit.prevent="saveCategory">
          <input v-model="categoryForm.name" type="text" required placeholder="Name" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm" />
          <input v-model="categoryForm.slug" type="text" required placeholder="slug-name" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm" />
          <button type="submit" class="min-h-[40px] rounded-xl bg-brand-600 px-4 text-xs font-bold text-white">
            {{ categoryForm.id ? 'Update' : 'Add Category' }}
          </button>
        </form>
        <div class="space-y-2">
          <div v-for="cat in categories" :key="cat.id" class="flex items-center justify-between rounded-xl bg-surface-page px-3 py-2 text-sm">
            <span><strong>{{ cat.name }}</strong> <span class="text-xs text-slate-500">({{ cat.slug }})</span></span>
            <div class="flex gap-2">
              <button type="button" class="text-xs font-semibold text-brand-600" @click="categoryForm = { id: cat.id, name: cat.name, slug: cat.slug, sortOrder: cat.sort_order }">Edit</button>
              <button type="button" class="text-xs text-rose-600" @click="removeCategory(cat.id)">Delete</button>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
        <h2 class="text-lg font-extrabold text-brand-900">Mentors</h2>
        <form class="space-y-2" @submit.prevent="saveMentor">
          <div class="grid grid-cols-2 gap-2">
            <input v-model="mentorForm.name" type="text" required placeholder="Mentor Name" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm" />
            <input v-model="mentorForm.title" type="text" required placeholder="Specialization" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm" />
          </div>
          <div class="flex gap-2">
            <input v-model="mentorForm.bio" type="text" placeholder="Short Bio" class="min-h-[40px] flex-1 rounded-xl border border-surface-border px-3 text-sm" />
            <button type="submit" class="min-h-[40px] rounded-xl bg-brand-600 px-4 text-xs font-bold text-white">
              {{ mentorForm.id ? 'Update' : 'Add Mentor' }}
            </button>
          </div>
        </form>
        <div class="space-y-2 max-h-60 overflow-y-auto">
          <div v-for="m in mentors" :key="m.id" class="flex items-center justify-between rounded-xl bg-surface-page px-3 py-2 text-sm">
            <div>
              <p class="font-bold text-brand-900">{{ m.name }}</p>
              <p class="text-xs text-slate-500">{{ m.title }}</p>
            </div>
            <div class="flex gap-2">
              <button type="button" class="text-xs font-semibold text-brand-600" @click="mentorForm = { id: m.id, userId: m.user_id || null, name: m.name, title: m.title, bio: m.bio || '', photoUrl: m.photo_url || '', sortOrder: m.sort_order, isActive: Boolean(m.is_active) }">Edit</button>
              <button type="button" class="text-xs text-rose-600" @click="removeMentor(m.id)">Delete</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <ModalDialog :open="courseModalOpen" :title="courseForm.id ? 'Edit Course' : 'Add Course'" @close="courseModalOpen = false">
      <form class="space-y-4" @submit.prevent="saveCourse">
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Title</label>
          <input v-model="courseForm.title" type="text" required class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Category</label>
            <select v-model="courseForm.categoryId" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm">
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Mentor</label>
            <select v-model="courseForm.mentorId" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm">
              <option v-for="m in mentors" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Price (USD)</label>
            <input v-model="courseForm.price" type="number" min="0" step="0.01" required class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Badge</label>
            <input v-model="courseForm.badge" type="text" placeholder="Best Seller" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Level</label>
            <select v-model="courseForm.level" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Thumbnail URL or Upload</label>
          <div class="flex gap-2">
            <input v-model="courseForm.thumbnailUrl" type="text" placeholder="https://... or /uploads/..." class="min-h-[42px] flex-1 rounded-xl border border-surface-border px-3 text-sm" />
            <label class="inline-flex min-h-[42px] cursor-pointer items-center gap-1.5 rounded-xl border border-surface-border bg-surface-page px-3 text-xs font-bold text-brand-700 hover:bg-brand-50">
              <Upload class="h-4 w-4" />
              Upload
              <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
            </label>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Description</label>
          <textarea v-model="courseForm.description" rows="3" required minlength="10" class="w-full rounded-xl border border-surface-border p-3 text-sm" />
        </div>
        <div class="flex items-center justify-between">
          <label class="inline-flex items-center gap-2 text-sm font-semibold">
            <input v-model="courseForm.isPublished" type="checkbox" />
            Published on Catalog
          </label>
          <div class="flex gap-2">
            <button type="button" class="min-h-[42px] rounded-xl border border-surface-border px-4 text-sm font-semibold" @click="courseModalOpen = false">Cancel</button>
            <button type="submit" class="min-h-[42px] rounded-xl bg-brand-600 px-5 text-sm font-bold text-white">Save Course</button>
          </div>
        </div>
      </form>
    </ModalDialog>

    <ModalDialog :open="curriculumModalOpen" :title="`Syllabus: ${activeCourse?.title || ''}`" @close="curriculumModalOpen = false">
      <div class="space-y-4">
        <form class="flex gap-2" @submit.prevent="addSection">
          <input v-model="newSectionTitle" type="text" required placeholder="New Section Title" class="min-h-[40px] flex-1 rounded-xl border border-surface-border px-3 text-sm" />
          <button type="submit" class="rounded-xl bg-brand-600 px-4 text-xs font-bold text-white">Add Section</button>
        </form>
        <form v-if="curriculum.length > 0" class="rounded-xl border border-surface-border bg-surface-page p-3 space-y-2" @submit.prevent="addLesson">
          <select v-model="lessonForm.sectionId" class="min-h-[38px] w-full rounded-lg border border-surface-border bg-white px-2 text-sm">
            <option v-for="sec in curriculum" :key="sec.id" :value="sec.id">{{ sec.title }}</option>
          </select>
          <input v-model="lessonForm.title" type="text" required placeholder="Lesson Title" class="min-h-[38px] w-full rounded-lg border border-surface-border bg-white px-3 text-sm" />
          <input v-model="lessonForm.videoUrl" type="url" required placeholder="Video MP4 URL" class="min-h-[38px] w-full rounded-lg border border-surface-border bg-white px-3 text-sm" />
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold flex items-center gap-1.5"><input v-model="lessonForm.isPreview" type="checkbox" /> Preview</label>
            <button type="submit" class="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white">Add Lesson</button>
          </div>
        </form>
        <div v-for="sec in curriculum" :key="sec.id" class="rounded-xl border border-surface-border p-3 space-y-1.5">
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold uppercase text-brand-900">{{ sec.title }}</p>
            <button type="button" class="text-xs text-rose-600 hover:underline" @click="removeSection(sec.id)">Delete Section</button>
          </div>
          <div v-for="les in sec.lessons" :key="les.id" class="flex items-center justify-between text-xs bg-surface-page px-3 py-1.5 rounded-lg">
            <span>{{ les.title }}</span>
            <button type="button" class="text-rose-600" @click="removeLesson(les.id)">Remove</button>
          </div>
        </div>
      </div>
    </ModalDialog>
  </div>
</template>
