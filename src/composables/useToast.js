import { useUiStore } from '../stores/ui.store.js';

export function useToast() {
  const ui = useUiStore();

  return {
    success(message, title = 'Berhasil') {
      ui.addToast({ type: 'success', title, message });
    },
    error(message, title = 'Terjadi Kesalahan') {
      ui.addToast({ type: 'error', title, message });
    },
    info(message, title = 'Info') {
      ui.addToast({ type: 'info', title, message });
    }
  };
}
