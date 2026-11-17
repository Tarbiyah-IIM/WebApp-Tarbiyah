import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', () => {
  const toasts = ref([]);
  const prefillEmail = ref('');
  const cartItems = ref(JSON.parse(localStorage.getItem('meekoo_cart') || '[]'));

  const cartCount = computed(() => cartItems.value.length);
  const cartTotal = computed(() =>
    cartItems.value.reduce((sum, item) => sum + Number(item.price || 0), 0)
  );

  function addToast({ type = 'info', title = '', message = '' }) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    toasts.value.push({ id, type, title, message });
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function persistCart() {
    localStorage.setItem('meekoo_cart', JSON.stringify(cartItems.value));
  }

  function addToCart(course) {
    if (!cartItems.value.some((c) => c.id === course.id)) {
      cartItems.value.push({
        id: course.id,
        title: course.title,
        slug: course.slug,
        price: Number(course.price),
        currency: course.currency || 'USD',
        thumbnail_url: course.thumbnail_url,
        mentor_name: course.mentor_name
      });
      persistCart();
      return true;
    }
    return false;
  }

  function removeFromCart(courseId) {
    cartItems.value = cartItems.value.filter((c) => c.id !== courseId);
    persistCart();
  }

  function clearCart() {
    cartItems.value = [];
    persistCart();
  }

  function setPrefillEmail(email) {
    prefillEmail.value = email;
  }

  return {
    toasts,
    prefillEmail,
    cartItems,
    cartCount,
    cartTotal,
    addToast,
    removeToast,
    addToCart,
    removeFromCart,
    clearCart,
    setPrefillEmail
  };
});
