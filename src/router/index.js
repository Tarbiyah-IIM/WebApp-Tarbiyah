import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.store.js';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/courses',
    name: 'courses',
    component: () => import('../views/CoursesView.vue')
  },
  {
    path: '/courses/:slug',
    name: 'course-detail',
    component: () => import('../views/CourseDetailView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('../views/ForgotPasswordView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/checkout/:orderId?',
    name: 'checkout',
    component: () => import('../views/CheckoutView.vue')
  },
  {
    path: '/dashboard',
    name: 'student-dashboard',
    component: () => import('../views/StudentDashboardView.vue'),
    meta: { requiresAuth: true, roles: ['student', 'mentor', 'admin'] }
  },
  {
    path: '/learn/:id',
    name: 'learn',
    component: () => import('../views/LearnView.vue'),
    meta: { requiresAuth: true, roles: ['student', 'mentor', 'admin'] }
  },
  {
    path: '/mentor',
    name: 'mentor-dashboard',
    component: () => import('../views/MentorDashboardView.vue'),
    meta: { requiresAuth: true, roles: ['mentor', 'admin'] }
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('../views/AdminDashboardView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/verify-certificate',
    name: 'verify-certificate',
    component: () => import('../views/CertificateVerifyView.vue')
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('../views/LegalView.vue'),
    props: { type: 'terms' }
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('../views/LegalView.vue'),
    props: { type: 'privacy' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    }
    return { top: 0 };
  }
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!auth.hydrated) {
    await auth.initSession();
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    if (auth.isAdmin) return '/admin';
    if (auth.isMentor) return '/mentor';
    return '/dashboard';
  }

  if (to.meta.roles && !to.meta.roles.includes(auth.user?.role)) {
    if (auth.isAdmin) return '/admin';
    if (auth.isMentor) return '/mentor';
    return '/dashboard';
  }

  return true;
});

export default router;
