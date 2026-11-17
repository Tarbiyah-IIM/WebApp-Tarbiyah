<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Menu, X, ShoppingBag, GraduationCap, LogOut, LayoutDashboard } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth.store.js';
import { useUiStore } from '../stores/ui.store.js';

const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();
const mobileOpen = ref(false);

const dashboardRoute = computed(() => {
  if (auth.isAdmin) return '/admin';
  if (auth.isMentor) return '/mentor';
  return '/dashboard';
});

const navLinks = [
  { label: 'About Us', to: '/#features' },
  { label: 'Courses', to: '/courses' },
  { label: 'Shop', to: '/checkout' },
  { label: 'Blog', to: '/#testimonials' },
  { label: 'Contact Us', to: '/#footer-cta' }
];

async function handleLogout() {
  await auth.logout();
  mobileOpen.value = false;
  router.push('/');
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-surface-border/80 bg-white/95 backdrop-blur-md">
    <nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8" aria-label="Main Navigation">
      <router-link to="/" class="flex items-center gap-2.5 min-h-[44px]">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
          <GraduationCap class="h-6 w-6" />
        </div>
        <span class="text-xl font-extrabold tracking-tight text-brand-900">Meekoo</span>
      </router-link>

      <div class="hidden items-center gap-7 lg:flex">
        <router-link
          v-for="link in navLinks"
          :key="link.label"
          :to="link.to"
          class="text-sm font-semibold text-slate-700 transition hover:text-brand-600"
        >
          {{ link.label }}
        </router-link>
      </div>

      <div class="hidden items-center gap-3 lg:flex">
        <router-link
          to="/checkout"
          class="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-surface-border bg-surface-page px-3 text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition"
          aria-label="Checkout Cart"
        >
          <ShoppingBag class="h-5 w-5" />
          <span
            v-if="ui.cartCount > 0"
            class="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white"
          >
            {{ ui.cartCount }}
          </span>
        </router-link>

        <template v-if="auth.isAuthenticated">
          <router-link
            :to="dashboardRoute"
            class="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition"
          >
            <LayoutDashboard class="h-4 w-4" />
            <span>{{ auth.user.role.toUpperCase() }} Panel</span>
          </router-link>
          <button
            type="button"
            class="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-surface-border px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
            @click="handleLogout"
          >
            <LogOut class="h-4 w-4" />
            Logout
          </button>
        </template>
        <template v-else>
          <router-link
            to="/login"
            class="inline-flex min-h-[44px] items-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition"
          >
            Login
          </router-link>
        </template>
      </div>

      <div class="flex items-center gap-2 lg:hidden">
        <router-link
          to="/checkout"
          class="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-surface-border text-slate-700"
          aria-label="Cart"
        >
          <ShoppingBag class="h-5 w-5" />
          <span
            v-if="ui.cartCount > 0"
            class="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white"
          >
            {{ ui.cartCount }}
          </span>
        </router-link>
        <button
          type="button"
          class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-surface-border text-slate-700"
          :aria-expanded="mobileOpen"
          aria-label="Toggle Menu"
          @click="mobileOpen = !mobileOpen"
        >
          <X v-if="mobileOpen" class="h-6 w-6" />
          <Menu v-else class="h-6 w-6" />
        </button>
      </div>
    </nav>

    <div v-if="mobileOpen" class="border-t border-surface-border bg-white px-4 py-4 lg:hidden">
      <div class="flex flex-col gap-2">
        <router-link
          v-for="link in navLinks"
          :key="link.label"
          :to="link.to"
          class="flex min-h-[44px] items-center rounded-xl px-3 text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700"
          @click="mobileOpen = false"
        >
          {{ link.label }}
        </router-link>
        <div class="mt-2 border-t border-surface-border pt-3 flex flex-col gap-2">
          <template v-if="auth.isAuthenticated">
            <router-link
              :to="dashboardRoute"
              class="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white"
              @click="mobileOpen = false"
            >
              <LayoutDashboard class="h-4 w-4" />
              {{ auth.user.role.toUpperCase() }} Dashboard
            </router-link>
            <button
              type="button"
              class="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-surface-border px-4 text-sm font-semibold text-slate-700"
              @click="handleLogout"
            >
              <LogOut class="h-4 w-4" />
              Logout
            </button>
          </template>
          <router-link
            v-else
            to="/login"
            class="flex min-h-[44px] items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white"
            @click="mobileOpen = false"
          >
            Login
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>
