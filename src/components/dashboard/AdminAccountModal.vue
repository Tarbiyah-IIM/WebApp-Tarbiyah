<script setup>
import { reactive, ref, watch } from 'vue';
import { Eye, EyeOff, KeyRound, X } from 'lucide-vue-next';
import { useAuthStore } from '../../stores/auth.store.js';
import { useFocusTrap } from '../../composables/useFocusTrap.js';
import { useI18n } from '../../composables/useI18n.js';

const props = defineProps({
  open: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'saved']);

const auth = useAuthStore();
const { t } = useI18n();
const dialogRef = ref(null);
const busy = ref(false);
const errorMessage = ref('');
const showCurrent = ref(false);
const showNext = ref(false);

const form = reactive({
  name: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

function syncFromUser() {
  form.name = auth.user?.name || '';
  form.email = auth.user?.email || '';
  form.currentPassword = '';
  form.newPassword = '';
  form.confirmPassword = '';
  errorMessage.value = '';
  showCurrent.value = false;
  showNext.value = false;
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) syncFromUser();
  }
);

useFocusTrap(dialogRef, () => props.open, {
  onEscape: () => {
    if (!busy.value) emit('close');
  }
});

async function submit() {
  if (busy.value) return;
  errorMessage.value = '';

  const trimmedName = form.name.trim();
  const normalizedEmail = form.email.trim().toLowerCase();
  const originalEmail = String(auth.user?.email || '').trim().toLowerCase();
  const emailChanged = Boolean(normalizedEmail && normalizedEmail !== originalEmail);
  const passwordChanged = Boolean(form.newPassword);

  if (trimmedName.length < 2) {
    errorMessage.value = t('adminDashboard.accountModal.nameLengthError');
    return;
  }

  if (passwordChanged) {
    const validLength = form.newPassword.length >= 8 && form.newPassword.length <= 72;
    const hasLetterAndDigit = /[A-Za-z]/.test(form.newPassword) && /[0-9]/.test(form.newPassword);
    if (!validLength || !hasLetterAndDigit) {
      errorMessage.value = t('adminDashboard.accountModal.passwordRuleError');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      errorMessage.value = t('adminDashboard.accountModal.passwordMismatchError');
      return;
    }
  }

  if ((emailChanged || passwordChanged) && !form.currentPassword) {
    errorMessage.value = t('adminDashboard.accountModal.currentPasswordRequired');
    return;
  }

  const payload = { name: trimmedName };
  if (emailChanged) payload.email = normalizedEmail;
  if (passwordChanged) payload.newPassword = form.newPassword;
  if (emailChanged || passwordChanged) payload.currentPassword = form.currentPassword;

  busy.value = true;
  try {
    const updatedUser = await auth.updateAccount(payload);
    emit('saved', updatedUser);
    emit('close');
  } catch (err) {
    errorMessage.value = err?.response?.data?.error?.message || err?.message || t('apiError.requestFailed');
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      @click.self="!busy && emit('close')"
    >
      <div
        ref="dialogRef"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        :aria-label="t('adminDashboard.accountModal.title')"
        :aria-busy="busy"
        class="w-full max-w-lg rounded-2xl border border-surface-border bg-white p-6 shadow-float focus:outline-none"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <KeyRound class="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 class="text-base font-extrabold text-brand-900">{{ t('adminDashboard.accountModal.title') }}</h3>
              <p class="mt-0.5 text-xs leading-relaxed text-slate-500">
                {{ t('adminDashboard.accountModal.subtitle') }}
              </p>
            </div>
          </div>
          <button
            type="button"
            :disabled="busy"
            :aria-label="t('adminDashboard.cancelBtn')"
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-surface-muted hover:text-brand-900"
            @click="emit('close')"
          >
            <X class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form class="mt-5 space-y-4" @submit.prevent="submit">
          <p
            v-if="errorMessage"
            role="alert"
            class="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700"
          >
            {{ errorMessage }}
          </p>

          <div>
            <label for="admin-account-name" class="mb-1.5 block text-xs font-bold text-slate-700">
              {{ t('adminDashboard.accountModal.nameLabel') }}
            </label>
            <input
              id="admin-account-name"
              v-model="form.name"
              type="text"
              required
              minlength="2"
              maxlength="120"
              class="min-h-[42px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
            />
          </div>

          <div>
            <label for="admin-account-email" class="mb-1.5 block text-xs font-bold text-slate-700">
              {{ t('adminDashboard.accountModal.emailLabel') }}
            </label>
            <input
              id="admin-account-email"
              v-model="form.email"
              type="email"
              required
              maxlength="191"
              class="min-h-[42px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
            />
          </div>

          <div class="border-t border-surface-border pt-4 space-y-3">
            <div>
              <label for="admin-account-current-pass" class="mb-1.5 block text-xs font-bold text-slate-700">
                {{ t('adminDashboard.accountModal.currentPasswordLabel') }}
              </label>
              <div class="relative">
                <input
                  id="admin-account-current-pass"
                  v-model="form.currentPassword"
                  :type="showCurrent ? 'text' : 'password'"
                  autocomplete="current-password"
                  :placeholder="t('adminDashboard.accountModal.currentPasswordPlaceholder')"
                  class="min-h-[42px] w-full rounded-xl border border-surface-border pl-3.5 pr-10 text-sm"
                />
                <button
                  type="button"
                  :aria-label="showCurrent ? 'Hide current passcode' : 'Show current passcode'"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:bg-surface-muted"
                  @click="showCurrent = !showCurrent"
                >
                  <EyeOff v-if="showCurrent" class="h-4 w-4" aria-hidden="true" />
                  <Eye v-else class="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <p class="mt-1 text-[11px] text-slate-500">
                {{ t('adminDashboard.accountModal.currentPasswordHint') }}
              </p>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label for="admin-account-new-pass" class="mb-1.5 block text-xs font-bold text-slate-700">
                  {{ t('adminDashboard.accountModal.newPasswordLabel') }}
                </label>
                <div class="relative">
                  <input
                    id="admin-account-new-pass"
                    v-model="form.newPassword"
                    :type="showNext ? 'text' : 'password'"
                    autocomplete="new-password"
                    :placeholder="t('adminDashboard.accountModal.newPasswordPlaceholder')"
                    class="min-h-[42px] w-full rounded-xl border border-surface-border pl-3.5 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    :aria-label="showNext ? 'Hide new passcode' : 'Show new passcode'"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:bg-surface-muted"
                    @click="showNext = !showNext"
                  >
                    <EyeOff v-if="showNext" class="h-4 w-4" aria-hidden="true" />
                    <Eye v-else class="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div>
                <label for="admin-account-confirm-pass" class="mb-1.5 block text-xs font-bold text-slate-700">
                  {{ t('adminDashboard.accountModal.confirmPasswordLabel') }}
                </label>
                <input
                  id="admin-account-confirm-pass"
                  v-model="form.confirmPassword"
                  :type="showNext ? 'text' : 'password'"
                  autocomplete="new-password"
                  :placeholder="t('adminDashboard.accountModal.confirmPasswordPlaceholder')"
                  class="min-h-[42px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              :disabled="busy"
              class="min-h-[40px] rounded-xl border border-surface-border bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-surface-muted disabled:opacity-50"
              @click="emit('close')"
            >
              {{ t('adminDashboard.cancelBtn') }}
            </button>
            <button
              type="submit"
              :disabled="busy"
              data-testid="save-admin-account-btn"
              class="min-h-[40px] rounded-xl bg-brand-600 px-5 text-xs font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {{ busy ? t('adminDashboard.accountModal.savingBtn') : t('adminDashboard.accountModal.saveBtn') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
