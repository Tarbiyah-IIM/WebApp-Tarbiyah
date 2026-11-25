import { useUiStore } from '../stores/ui.store.js';
import { useI18n } from './useI18n.js';

export function useToast() {
  const ui = useUiStore();
  const { t } = useI18n();

  return {
    success(message, title = t('toast.success')) {
      ui.addToast({ type: 'success', title, message });
    },
    error(message, title = t('toast.error')) {
      ui.addToast({ type: 'error', title, message });
    },
    info(message, title = t('toast.info')) {
      ui.addToast({ type: 'info', title, message });
    }
  };
}
