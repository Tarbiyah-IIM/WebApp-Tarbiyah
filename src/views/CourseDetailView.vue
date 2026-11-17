<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  PlayCircle,
  Clock,
  Star,
  Lock,
  Play,
  CheckCircle2,
  ShoppingBag,
  ArrowRight
} from 'lucide-vue-next';
import { publicService } from '../services/public.service.js';
import { useAsyncState } from '../composables/useAsyncState.js';
import { useFormatters } from '../composables/useFormatters.js';
import { useAuthStore } from '../stores/auth.store.js';
import { useUiStore } from '../stores/ui.store.js';
import { useToast } from '../composables/useToast.js';
import StateFeedback from '../components/StateFeedback.vue';
import ModalDialog from '../components/ModalDialog.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();
const toast = useToast();
const { formatPrice, formatDuration, formatDate } = useFormatters();
const { loading, error, isOffline, run } = useAsyncState();

const detail = ref(null);
const previewLesson = ref(null);

async function fetchDetail() {
  await run(async () => {
    detail.value = await publicService.getCourseDetail(route.params.slug);
  });
}

function enrollNow() {
  const course = detail.value?.course;
  if (!course) return;
  if (detail.value.hasAccess) {
    router.push(`/learn/${course.id}`);
    return;
  }
  ui.addToCart(course);
  if (!auth.isAuthenticated) {
    toast.info('Please login or register to complete enrollment.');
    router.push({ path: '/login', query: { redirect: '/checkout' } });
    return;
  }
  router.push('/checkout');
}

function addToCartOnly() {
  const course = detail.value?.course;
  if (!course) return;
  const added = ui.addToCart(course);
  toast.success(added ? 'Added to cart.' : 'Already in cart.');
}

onMounted(fetchDetail);
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <StateFeedback
      :loading="loading"
      :error="error"
      :offline="isOffline"
      :empty="!loading && !detail"
      @retry="fetchDetail"
    >
      <template v-if="detail">
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div class="lg:col-span-8 space-y-8">
            <div class="rounded-3xl bg-brand-900 p-8 text-white">
              <div class="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span class="rounded-full bg-brand-600 px-3 py-1">{{ detail.course.category_name }}</span>
                <span v-if="detail.course.badge" class="rounded-full bg-amber-400 px-3 py-1 text-slate-900">
                  {{ detail.course.badge }}
                </span>
                <span class="rounded-full bg-white/10 px-3 py-1 uppercase">{{ detail.course.level }}</span>
              </div>
              <h1 class="mt-4 text-3xl font-extrabold sm:text-4xl">{{ detail.course.title }}</h1>
              <p class="mt-3 text-base text-slate-300">{{ detail.course.subtitle }}</p>

              <div class="mt-6 flex flex-wrap items-center gap-6 text-sm text-slate-200">
                <span class="inline-flex items-center gap-1.5">
                  <Star class="h-4 w-4 fill-amber-400 text-amber-400" />
                  <strong>{{ Number(detail.course.rating_avg || 0).toFixed(1) }}</strong>
                  <span>({{ detail.course.rating_count }} reviews)</span>
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <PlayCircle class="h-4 w-4 text-brand-400" />
                  {{ detail.course.total_videos }} lessons
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <Clock class="h-4 w-4 text-brand-400" />
                  {{ detail.course.duration_hours }} total hours
                </span>
              </div>
            </div>

            <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card">
              <h2 class="text-xl font-extrabold text-brand-900">About This Course</h2>
              <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {{ detail.course.description }}
              </p>
            </section>

            <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card">
              <h2 class="text-xl font-extrabold text-brand-900">Curriculum</h2>
              <div class="mt-4 space-y-4">
                <div
                  v-for="section in detail.curriculum"
                  :key="section.id"
                  class="overflow-hidden rounded-xl border border-surface-border"
                >
                  <div class="bg-surface-muted px-4 py-3 font-bold text-sm text-brand-900">
                    {{ section.title }}
                  </div>
                  <ul class="divide-y divide-surface-border">
                    <li
                      v-for="lesson in section.lessons"
                      :key="lesson.id"
                      class="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                    >
                      <div class="flex items-center gap-3 min-w-0">
                        <Play v-if="lesson.is_preview || detail.hasAccess" class="h-4 w-4 shrink-0 text-brand-600" />
                        <Lock v-else class="h-4 w-4 shrink-0 text-slate-400" />
                        <span class="truncate font-medium text-brand-900">{{ lesson.title }}</span>
                      </div>
                      <div class="flex items-center gap-3 shrink-0">
                        <button
                          v-if="lesson.is_preview && lesson.video_url"
                          type="button"
                          class="rounded-lg bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                          @click="previewLesson = lesson"
                        >
                          Preview
                        </button>
                        <span class="text-xs text-slate-500">{{ formatDuration(lesson.duration_sec) }}</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card">
              <h2 class="text-xl font-extrabold text-brand-900">Instructor</h2>
              <div class="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <img
                  :src="detail.course.mentor_photo_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(detail.course.mentor_name)}`"
                  :alt="detail.course.mentor_name"
                  class="h-20 w-20 rounded-2xl object-cover border border-surface-border bg-slate-100"
                />
                <div>
                  <h3 class="text-lg font-bold text-brand-900">{{ detail.course.mentor_name }}</h3>
                  <p class="text-sm font-semibold text-brand-600">{{ detail.course.mentor_title }}</p>
                  <p class="mt-2 text-sm text-slate-600">{{ detail.course.mentor_bio }}</p>
                </div>
              </div>
            </section>

            <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card">
              <h2 class="text-xl font-extrabold text-brand-900">Student Reviews</h2>
              <p v-if="detail.reviews.length === 0" class="mt-3 text-sm text-slate-500">
                No reviews yet. Enroll and be the first to share feedback!
              </p>
              <div v-else class="mt-4 space-y-4">
                <div
                  v-for="rev in detail.reviews"
                  :key="rev.id"
                  class="rounded-xl border border-surface-border bg-surface-page p-4"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                      <img
                        :src="rev.user_avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(rev.user_name)}`"
                        :alt="rev.user_name"
                        class="h-8 w-8 rounded-full"
                      />
                      <div>
                        <p class="text-sm font-bold text-brand-900">{{ rev.user_name }}</p>
                        <p class="text-[11px] text-slate-500">{{ formatDate(rev.created_at) }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-0.5">
                      <Star v-for="n in rev.rating" :key="n" class="h-4 w-4 fill-amber-400 text-amber-400" />
                    </div>
                  </div>
                  <p class="mt-2.5 text-sm text-slate-700">{{ rev.comment }}</p>
                </div>
              </div>
            </section>
          </div>

          <aside class="lg:col-span-4">
            <div class="sticky top-24 rounded-2xl border border-surface-border bg-white p-6 shadow-float space-y-5">
              <img
                :src="detail.course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80'"
                :alt="detail.course.title"
                class="aspect-video w-full rounded-xl object-cover"
              />
              <div class="flex items-baseline justify-between">
                <span class="text-3xl font-extrabold text-brand-900">
                  {{ formatPrice(detail.course.price, detail.course.currency) }}
                </span>
                <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  14-day refund guarantee
                </span>
              </div>

              <div class="space-y-3">
                <button
                  type="button"
                  class="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700 transition"
                  @click="enrollNow"
                >
                  <span>{{ detail.hasAccess ? 'Continue Learning' : 'Enroll Now' }}</span>
                  <ArrowRight class="h-4 w-4" />
                </button>
                <button
                  v-if="!detail.hasAccess"
                  type="button"
                  class="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-page px-5 text-sm font-semibold text-brand-900 hover:bg-brand-50 transition"
                  @click="addToCartOnly"
                >
                  <ShoppingBag class="h-4 w-4" />
                  Add to Cart
                </button>
              </div>

              <ul class="space-y-2.5 border-t border-surface-border pt-4 text-sm text-slate-600">
                <li class="flex items-center gap-2">
                  <CheckCircle2 class="h-4 w-4 text-emerald-600 shrink-0" />
                  Full lifetime course access
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle2 class="h-4 w-4 text-emerald-600 shrink-0" />
                  Course community & mentor Q&A
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle2 class="h-4 w-4 text-emerald-600 shrink-0" />
                  Verified completion certificate
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </template>
    </StateFeedback>

    <ModalDialog
      :open="Boolean(previewLesson)"
      :title="previewLesson ? `Free Preview: ${previewLesson.title}` : ''"
      @close="previewLesson = null"
    >
      <div v-if="previewLesson" class="space-y-3">
        <video
          :src="previewLesson.video_url"
          controls
          autoplay
          class="aspect-video w-full rounded-xl bg-black"
        />
        <p class="text-sm text-slate-600">{{ previewLesson.summary }}</p>
      </div>
    </ModalDialog>
  </div>
</template>
