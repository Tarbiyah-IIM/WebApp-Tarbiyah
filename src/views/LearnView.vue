<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  CheckCircle2,
  Circle,
  Award,
  MessageSquare,
  Star,
  Send,
  Trash2
} from 'lucide-vue-next';
import { studentService } from '../services/student.service.js';
import { extractApiError } from '../services/api.js';
import { useAsyncState } from '../composables/useAsyncState.js';
import { useFormatters } from '../composables/useFormatters.js';
import { useAuthStore } from '../stores/auth.store.js';
import { useToast } from '../composables/useToast.js';
import StateFeedback from '../components/StateFeedback.vue';

const route = useRoute();
const auth = useAuthStore();
const toast = useToast();
const { formatDuration, formatDateTime } = useFormatters();
const { loading, error, isOffline, run } = useAsyncState();

const learnData = ref(null);
const activeLesson = ref(null);
const activeTab = ref('overview');
const posts = ref([]);
const newPostBody = ref('');
const replyBody = ref('');
const replyingTo = ref(null);
const reviewRating = ref(5);
const reviewComment = ref('');
const savingAction = ref(false);

const flatLessons = computed(() => {
  if (!learnData.value?.curriculum) return [];
  return learnData.value.curriculum.flatMap((sec) => sec.lessons);
});

const completedSet = computed(() => new Set(learnData.value?.completedLessonIds || []));

async function fetchCourseLearn() {
  const courseId = route.params.id;
  await run(async () => {
    const [data, comm] = await Promise.all([
      studentService.getLearnCourse(courseId),
      studentService.getCommunityPosts(courseId)
    ]);
    learnData.value = data;
    posts.value = comm.items;

    const lessons = data.curriculum.flatMap((s) => s.lessons);
    if (lessons.length > 0) {
      const target = lessons.find((l) => l.id === data.lastLessonId) || lessons[0];
      activeLesson.value = target;
    }
  });
}

async function markCompleted() {
  if (!activeLesson.value) return;
  savingAction.value = true;
  try {
    const res = await studentService.completeLesson(activeLesson.value.id);
    if (!learnData.value.completedLessonIds.includes(activeLesson.value.id)) {
      learnData.value.completedLessonIds.push(activeLesson.value.id);
    }
    learnData.value.progressPct = res.progressPct;
    if (res.certificate) {
      learnData.value.certificate = res.certificate;
      toast.success(`100% Completed! Certificate ${res.certificate.certificate_code} issued.`);
    } else {
      toast.success(`Lesson completed! Course progress: ${res.progressPct}%`);
    }

    const idx = flatLessons.value.findIndex((l) => l.id === activeLesson.value.id);
    if (idx >= 0 && idx + 1 < flatLessons.value.length) {
      activeLesson.value = flatLessons.value[idx + 1];
    }
  } catch (err) {
    toast.error(extractApiError(err));
  } finally {
    savingAction.value = false;
  }
}

async function submitPost(parentId = null) {
  const text = parentId ? replyBody.value.trim() : newPostBody.value.trim();
  if (!text) return;
  savingAction.value = true;
  try {
    await studentService.createCommunityPost(learnData.value.course.id, {
      parentId,
      body: text
    });
    const comm = await studentService.getCommunityPosts(learnData.value.course.id);
    posts.value = comm.items;
    if (parentId) {
      replyBody.value = '';
      replyingTo.value = null;
    } else {
      newPostBody.value = '';
    }
    toast.success('Posted to course community.');
  } catch (err) {
    toast.error(extractApiError(err));
  } finally {
    savingAction.value = false;
  }
}

async function deletePost(postId) {
  try {
    await studentService.deleteCommunityPost(postId);
    const comm = await studentService.getCommunityPosts(learnData.value.course.id);
    posts.value = comm.items;
    toast.success('Post removed.');
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function handleSubmitReview() {
  if (!reviewComment.value.trim()) return;
  savingAction.value = true;
  try {
    await studentService.submitReview(learnData.value.course.id, {
      rating: reviewRating.value,
      comment: reviewComment.value.trim()
    });
    toast.success('Thank you! Your review has been published.');
    reviewComment.value = '';
  } catch (err) {
    toast.error(extractApiError(err));
  } finally {
    savingAction.value = false;
  }
}

onMounted(fetchCourseLearn);
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <StateFeedback
      :loading="loading"
      :error="error"
      :offline="isOffline"
      :empty="!loading && !learnData"
      @retry="fetchCourseLearn"
    >
      <template v-if="learnData">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-surface-border bg-white p-5 shadow-card">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-brand-600">{{ learnData.course.category_name }}</p>
            <h1 class="text-xl font-extrabold text-brand-900 sm:text-2xl">{{ learnData.course.title }}</h1>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="text-xs font-semibold text-slate-500">Your Progress</p>
              <p class="text-lg font-extrabold text-brand-700">{{ Number(learnData.progressPct).toFixed(0) }}%</p>
            </div>
            <div class="h-2.5 w-36 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-emerald-500 transition-all"
                :style="{ width: `${Math.min(100, Number(learnData.progressPct))}%` }"
              />
            </div>
          </div>
        </div>

        <div
          v-if="learnData.certificate"
          class="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
        >
          <div class="flex items-center gap-3">
            <Award class="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <p class="text-sm font-bold text-emerald-900">Certificate Earned!</p>
              <p class="text-xs text-emerald-800">Verification Code: {{ learnData.certificate.certificate_code }}</p>
            </div>
          </div>
          <router-link
            :to="`/verify-certificate?code=${learnData.certificate.certificate_code}`"
            class="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
          >
            View Certificate
          </router-link>
        </div>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div class="lg:col-span-8 space-y-6">
            <div class="overflow-hidden rounded-2xl bg-black shadow-float">
              <video
                v-if="activeLesson?.video_url"
                :key="activeLesson.id"
                :src="activeLesson.video_url"
                controls
                class="aspect-video w-full"
              />
              <div v-else class="flex aspect-video items-center justify-center text-sm text-slate-400">
                Select a lesson to start watching.
              </div>
            </div>

            <div
              v-if="activeLesson"
              class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-surface-border bg-white p-5 shadow-card"
            >
              <div>
                <h2 class="text-lg font-extrabold text-brand-900">{{ activeLesson.title }}</h2>
                <p class="mt-1 text-sm text-slate-600">{{ activeLesson.summary }}</p>
              </div>
              <button
                type="button"
                :disabled="savingAction"
                class="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-5 text-sm font-bold transition"
                :class="
                  completedSet.has(activeLesson.id)
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-brand-600 text-white hover:bg-brand-700'
                "
                @click="markCompleted"
              >
                <CheckCircle2 class="h-4 w-4" />
                <span>{{ completedSet.has(activeLesson.id) ? 'Completed (Next Lesson)' : 'Mark Completed & Next' }}</span>
              </button>
            </div>

            <div class="rounded-2xl border border-surface-border bg-white p-6 shadow-card">
              <div class="flex gap-3 border-b border-surface-border pb-3 mb-5">
                <button
                  type="button"
                  class="rounded-xl px-4 py-2 text-sm font-bold"
                  :class="activeTab === 'overview' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'"
                  @click="activeTab = 'overview'"
                >
                  Course Overview & Review
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold"
                  :class="activeTab === 'community' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'"
                  @click="activeTab = 'community'"
                >
                  <MessageSquare class="h-4 w-4" />
                  Community ({{ posts.length }})
                </button>
              </div>

              <div v-if="activeTab === 'overview'" class="space-y-6">
                <p class="text-sm leading-relaxed text-slate-600">{{ learnData.course.description }}</p>

                <form class="rounded-2xl border border-surface-border bg-surface-page p-5 space-y-4" @submit.prevent="handleSubmitReview">
                  <h3 class="text-base font-bold text-brand-900">Rate & Review This Course</h3>
                  <div class="flex items-center gap-2">
                    <button
                      v-for="star in 5"
                      :key="star"
                      type="button"
                      class="p-1"
                      :aria-label="`Rate ${star} stars`"
                      @click="reviewRating = star"
                    >
                      <Star
                        class="h-6 w-6"
                        :class="star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'"
                      />
                    </button>
                  </div>
                  <textarea
                    v-model="reviewComment"
                    rows="3"
                    required
                    minlength="5"
                    placeholder="Share what you learned or liked about this course..."
                    class="w-full rounded-xl border border-surface-border bg-white p-3 text-sm"
                  />
                  <button
                    type="submit"
                    :disabled="savingAction"
                    class="min-h-[44px] rounded-xl bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700"
                  >
                    Submit Review
                  </button>
                </form>
              </div>

              <div v-else class="space-y-5">
                <form class="flex gap-2" @submit.prevent="submitPost(null)">
                  <input
                    v-model="newPostBody"
                    type="text"
                    required
                    placeholder="Ask a question or start a discussion..."
                    class="min-h-[44px] flex-1 rounded-xl border border-surface-border px-4 text-sm"
                  />
                  <button
                    type="submit"
                    :disabled="savingAction"
                    class="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700"
                  >
                    <Send class="h-4 w-4" />
                    Post
                  </button>
                </form>

                <div v-if="posts.length === 0" class="text-sm text-slate-500">
                  No discussions yet. Start the conversation!
                </div>

                <div v-for="post in posts" :key="post.id" class="rounded-xl border border-surface-border bg-surface-page p-4 space-y-3">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-bold text-brand-900">{{ post.user_name }}</span>
                        <span class="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-700">
                          {{ post.user_role }}
                        </span>
                      </div>
                      <p class="text-[11px] text-slate-500">{{ formatDateTime(post.created_at) }}</p>
                    </div>
                    <button
                      v-if="post.user_id === auth.user?.id || auth.isAdmin || auth.isMentor"
                      type="button"
                      class="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Delete post"
                      @click="deletePost(post.id)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                  <p class="text-sm text-slate-700">{{ post.body }}</p>

                  <div class="flex items-center gap-3">
                    <button
                      type="button"
                      class="text-xs font-semibold text-brand-600 hover:underline"
                      @click="replyingTo = replyingTo === post.id ? null : post.id"
                    >
                      Reply
                    </button>
                  </div>

                  <form
                    v-if="replyingTo === post.id"
                    class="flex gap-2 pl-4 border-l-2 border-brand-200"
                    @submit.prevent="submitPost(post.id)"
                  >
                    <input
                      v-model="replyBody"
                      type="text"
                      required
                      placeholder="Write a reply..."
                      class="min-h-[40px] flex-1 rounded-xl border border-surface-border bg-white px-3 text-sm"
                    />
                    <button type="submit" class="rounded-xl bg-brand-600 px-4 text-xs font-bold text-white">
                      Send
                    </button>
                  </form>

                  <div v-if="post.replies?.length" class="space-y-2 pl-4 border-l-2 border-slate-200">
                    <div v-for="rep in post.replies" :key="rep.id" class="rounded-xl bg-white p-3 text-sm">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-brand-900">{{ rep.user_name }} ({{ rep.user_role }})</span>
                        <button
                          v-if="rep.user_id === auth.user?.id || auth.isAdmin || auth.isMentor"
                          type="button"
                          class="text-slate-400 hover:text-rose-600"
                          @click="deletePost(rep.id)"
                        >
                          <Trash2 class="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p class="mt-1 text-slate-700">{{ rep.body }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside class="lg:col-span-4">
            <div class="sticky top-24 rounded-2xl border border-surface-border bg-white p-5 shadow-card space-y-4">
              <h2 class="text-base font-extrabold text-brand-900">Course Lessons</h2>
              <div v-for="sec in learnData.curriculum" :key="sec.id" class="space-y-2">
                <p class="text-xs font-bold uppercase tracking-wider text-slate-500">{{ sec.title }}</p>
                <button
                  v-for="lesson in sec.lessons"
                  :key="lesson.id"
                  type="button"
                  class="flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition"
                  :class="
                    activeLesson?.id === lesson.id
                      ? 'border-brand-600 bg-brand-50 text-brand-900 font-semibold'
                      : 'border-surface-border hover:bg-surface-page text-slate-700'
                  "
                  @click="activeLesson = lesson"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 v-if="completedSet.has(lesson.id)" class="h-4 w-4 shrink-0 text-emerald-600" />
                    <Circle v-else class="h-4 w-4 shrink-0 text-slate-300" />
                    <span class="truncate">{{ lesson.title }}</span>
                  </div>
                  <span class="text-xs text-slate-400 shrink-0">{{ formatDuration(lesson.duration_sec) }}</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </template>
    </StateFeedback>
  </div>
</template>
