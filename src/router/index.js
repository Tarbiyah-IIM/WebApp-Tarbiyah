import { createRouter, createWebHistory } from 'vue-router';
import { registerUnauthorizedRedirect, useAuthStore } from '../stores/auth.store.js';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/program-studi/:slug/dosen',
    name: 'study-program-lecturers',
    component: () => import('../views/ProgramLecturersView.vue')
  },
  {
    path: '/program-studi/:slug/dosen/:lecturerId',
    name: 'study-program-lecturer-detail',
    component: () => import('../views/ProgramLecturersView.vue')
  },
  {
    path: '/program-studi/:slug',
    name: 'study-program',
    component: () => import('../views/StudyProgramView.vue')
  },
  {
    path: '/akademik/administrasi-persuratan',
    name: 'academic-correspondence',
    component: () => import('../views/PortalInfoPageView.vue'),
    props: { pageKey: 'administrasi-persuratan' }
  },
  {
    path: '/akademik/ujian-komprehensif',
    name: 'academic-comprehensive',
    component: () => import('../views/PortalInfoPageView.vue'),
    props: { pageKey: 'ujian-komprehensif' }
  },
  {
    path: '/publikasi/ppl',
    name: 'publication-ppl',
    component: () => import('../views/PortalInfoPageView.vue'),
    props: { pageKey: 'ppl' }
  },
  {
    path: '/publikasi/pkn',
    name: 'publication-pkn',
    component: () => import('../views/PortalInfoPageView.vue'),
    props: { pageKey: 'pkn' }
  },
  {
    path: '/publikasi/jurnal',
    name: 'publication-jurnal',
    component: () => import('../views/PortalInfoPageView.vue'),
    props: { pageKey: 'jurnal' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('../views/ForgotPasswordView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('../views/AdminDashboardView.vue'),
    meta: { requiresAuth: true, roles: ['admin'], hidePublicNav: true }
  },
  {
    path: '/kuliah-tamu',
    name: 'guest-lecture',
    component: () => import('../views/GuestLectureView.vue')
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('../views/LegalView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from) {
    if (to.hash) {
      return new Promise((resolve) => {
        let attempts = 0;
        const tryFind = () => {
          let el = null;
          try {
            el = document.querySelector(to.hash);
          } catch {
            resolve({ top: 0 });
            return;
          }
          if (el || attempts >= 24) {
            resolve(el ? { el: to.hash, behavior: 'smooth' } : { top: 0 });
            return;
          }
          attempts += 1;
          setTimeout(tryFind, 50);
        };
        tryFind();
      });
    }
    const isLecturerModalToggle =
      from?.params?.slug &&
      from.params.slug === to.params?.slug &&
      (from.name === 'study-program-lecturers' || from.name === 'study-program-lecturer-detail') &&
      (to.name === 'study-program-lecturers' || to.name === 'study-program-lecturer-detail');
    if (isLecturerModalToggle) {
      return false;
    }
    if (
      from?.path === to.path &&
      !to.hash &&
      (from?.query?.newsId || to.query?.newsId || from?.query?.agendaId || to.query?.agendaId)
    ) {
      return false;
    }
    if (from?.path === '/' && to.path === '/') {
      return { top: 0, behavior: 'smooth' };
    }
    return { top: 0 };
  }
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!auth.hydrated || to.meta.requiresAuth) {
    await auth.initSession({ forceRefreshCheck: Boolean(to.meta.requiresAuth) });
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return auth.isAdmin ? '/admin' : '/';
  }

  if (to.meta.roles && !to.meta.roles.includes(auth.user?.role)) {
    return auth.isAdmin ? '/admin' : '/';
  }

  return true;
});

registerUnauthorizedRedirect(() => {
  const auth = useAuthStore();
  const current = router.currentRoute.value;
  if (!auth.isAuthenticated && current?.meta?.requiresAuth && current.path !== '/login') {
    router.push({ path: '/login', query: { redirect: current.fullPath } }).catch(() => {});
    return;
  }
  if (current?.meta?.roles && !current.meta.roles.includes(auth.user?.role)) {
    router.push('/').catch(() => {});
  }
});

export default router;
