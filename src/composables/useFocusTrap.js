import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

export function useFocusTrap(
  containerRef,
  isOpenGetter,
  { onEscape, initialFocus = true, trap = true } = {}
) {
  let lastFocusedElement = null;

  function getFocusableElements() {
    if (!containerRef.value) return [];
    return Array.from(containerRef.value.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    );
  }

  watch(
    isOpenGetter,
    async (isOpen) => {
      if (typeof document === 'undefined') return;
      if (isOpen) {
        lastFocusedElement = document.activeElement;
        await nextTick();
        if (!isOpenGetter() || !containerRef.value) return;
        if (initialFocus && !containerRef.value.contains(document.activeElement)) {
          const focusables = getFocusableElements();
          if (focusables.length > 0) {
            focusables[0].focus();
          } else {
            containerRef.value.focus();
          }
        }
      } else if (
        lastFocusedElement &&
        lastFocusedElement.isConnected &&
        typeof lastFocusedElement.focus === 'function'
      ) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
      } else {
        lastFocusedElement = null;
      }
    },
    { immediate: true }
  );

  function handleKeydown(event) {
    if (!isOpenGetter()) return;
    if (event.key === 'Escape') {
      if (onEscape) onEscape(event);
      return;
    }
    if (trap && event.key === 'Tab' && containerRef.value) {
      const focusables = getFocusableElements();
      if (!focusables.length) {
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first || !containerRef.value.contains(document.activeElement)) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last || !containerRef.value.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeydown);
    }
  });

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeydown);
    }
  });
}
