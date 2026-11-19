<script setup>
import { ChevronDown, ExternalLink, LayoutDashboard, LogOut, Moon, Sun } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth.store.js';
import { useUiStore } from '../stores/ui.store.js';
import { useI18n } from '../composables/useI18n.js';

defineProps({
  open: {
    type: Boolean,
    default: false
  },
  navMenus: {
    type: Array,
    required: true
  },
  mobileExpanded: {
    type: String,
    default: null
  },
  dashboardRoute: {
    type: String,
    default: '/'
  }
});

const emit = defineEmits(['toggle-submenu', 'close-all', 'pending-item', 'logout']);

const auth = useAuthStore();
const ui = useUiStore();
const { locale, setLocale, t } = useI18n();
</script>

<template>
  <div v-if="open" class="border-t border-surface-border bg-white px-4 py-4 lg:hidden">
    <div class="flex flex-col gap-1">
      <template v-for="menu in navMenus" :key="menu.id">
        <router-link
          v-if="!menu.children"
          :to="menu.to"
          class="flex min-h-[44px] items-center rounded-xl px-3 text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700"
          @click="emit('close-all')"
        >
          {{ menu.label }}
        </router-link>

        <div v-else class="flex flex-col">
          <button
            type="button"
            :aria-expanded="mobileExpanded === menu.id"
            class="flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700"
            @click="emit('toggle-submenu', menu.id)"
          >
            <span>{{ menu.label }}</span>
            <ChevronDown
              class="h-4 w-4 transition-transform duration-150"
              :class="{ 'rotate-180 text-brand-600': mobileExpanded === menu.id }"
            />
          </button>

          <div
            v-if="mobileExpanded === menu.id"
            class="ml-3 mt-1 flex flex-col gap-1 border-l-2 border-brand-100 pl-3 pb-2"
          >
            <template v-for="child in menu.children" :key="child.label">
              <a
                v-if="child.href"
                :href="child.href"
                target="_blank"
                rel="noopener noreferrer"
                class="flex min-h-[44px] items-center justify-between gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                @click="emit('close-all')"
              >
                <span>{{ child.label }}</span>
                <ExternalLink class="h-3.5 w-3.5 shrink-0 text-slate-400" />
              </a>
              <router-link
                v-else-if="child.to"
                :to="child.to"
                class="flex min-h-[44px] items-center rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                @click="emit('close-all')"
              >
                <span>{{ child.label }}</span>
              </router-link>
              <button
                v-else
                type="button"
                class="flex min-h-[44px] w-full items-center rounded-xl px-3 text-left text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                @click="emit('pending-item', menu.label, child.label)"
              >
                <span>{{ child.label }}</span>
              </button>
            </template>
          </div>
        </div>
      </template>

      <div class="mt-2 border-t border-surface-border pt-3 flex flex-col gap-2">
        <div class="flex items-center justify-between gap-2 pb-1">
          <div
            class="inline-flex items-center rounded-xl border border-surface-border bg-surface-muted p-0.5"
            role="group"
            :aria-label="t('lang.switchLabel')"
          >
            <button
              type="button"
              data-testid="lang-switch-id-mobile"
              :aria-pressed="locale === 'id'"
              class="min-h-[38px] rounded-lg px-3 text-xs font-bold transition"
              :class="locale === 'id' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600'"
              @click="setLocale('id')"
            >
              ID
            </button>
            <button
              type="button"
              data-testid="lang-switch-en-mobile"
              :aria-pressed="locale === 'en'"
              class="min-h-[38px] rounded-lg px-3 text-xs font-bold transition"
              :class="locale === 'en' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600'"
              @click="setLocale('en')"
            >
              EN
            </button>
          </div>
          <button
            type="button"
            :aria-pressed="ui.isNight"
            :aria-label="ui.isNight ? t('theme.switchToLight') : t('theme.switchToNight')"
            class="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-surface-border px-3 py-2 text-xs font-bold text-slate-700"
            @click="ui.toggleTheme"
          >
            <Moon v-if="ui.isNight" class="h-4 w-4 text-amber-300" />
            <Sun v-else class="h-4 w-4 text-amber-500" />
            <span>{{ ui.isNight ? t('theme.night') : t('theme.light') }}</span>
          </button>
        </div>
        <template v-if="auth.isAuthenticated">
          <router-link
            v-if="auth.isAdmin"
            :to="dashboardRoute"
            class="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white"
            @click="emit('close-all')"
          >
            <LayoutDashboard class="h-4 w-4" />
            {{ auth.user.role.toUpperCase() }} {{ t('nav.dashboardSuffix') }}
          </router-link>
          <button
            type="button"
            class="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-surface-border px-4 text-sm font-semibold text-slate-700"
            @click="emit('logout')"
          >
            <LogOut class="h-4 w-4" />
            {{ t('nav.logout') }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
