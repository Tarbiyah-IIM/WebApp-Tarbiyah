<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Trash2, Crown, CreditCard, CheckCircle2, XCircle, ShieldCheck } from 'lucide-vue-next';
import { studentService } from '../services/student.service.js';
import { extractApiError } from '../services/api.js';
import { useAuthStore } from '../stores/auth.store.js';
import { useUiStore } from '../stores/ui.store.js';
import { useFormatters } from '../composables/useFormatters.js';
import { useToast } from '../composables/useToast.js';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();
const toast = useToast();
const { formatPrice } = useFormatters();

const orderType = ref(route.query.plan === 'premium' ? 'subscription' : 'course');
const paymentMethod = ref('sandbox_card');
const activeOrder = ref(null);
const processing = ref(false);
const errorMessage = ref('');

async function loadExistingOrderIfParam() {
  if (!route.params.orderId) return;
  try {
    const res = await studentService.getOrderDetail(route.params.orderId);
    activeOrder.value = res.order;
  } catch (err) {
    errorMessage.value = extractApiError(err);
  }
}

async function handleCreateOrder() {
  if (!auth.isAuthenticated) {
    toast.info('Please login first to continue checkout.');
    router.push({ path: '/login', query: { redirect: '/checkout' } });
    return;
  }

  processing.value = true;
  errorMessage.value = '';
  try {
    const payload =
      orderType.value === 'subscription'
        ? { orderType: 'subscription', paymentMethod: paymentMethod.value }
        : {
            orderType: 'course',
            courseIds: ui.cartItems.map((c) => c.id),
            paymentMethod: paymentMethod.value
          };
    const res = await studentService.createOrder(payload);
    activeOrder.value = res.order;
    if (orderType.value === 'course') {
      ui.clearCart();
    }
    toast.success(`Order ${res.order.order_code} created. Complete sandbox payment below.`);
  } catch (err) {
    errorMessage.value = extractApiError(err);
  } finally {
    processing.value = false;
  }
}

async function handleSimulateGateway(outcome) {
  if (!activeOrder.value) return;
  processing.value = true;
  errorMessage.value = '';
  try {
    const res = await studentService.simulatePayment(activeOrder.value.id, outcome);
    activeOrder.value = res.order;
    await auth.refreshProfile();
    if (outcome === 'paid') {
      toast.success('Payment verified! Access unlocked on your Student Dashboard.');
    } else {
      toast.error('Payment marked as failed.');
    }
  } catch (err) {
    errorMessage.value = extractApiError(err);
  } finally {
    processing.value = false;
  }
}

onMounted(loadExistingOrderIfParam);
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 class="text-3xl font-extrabold text-brand-900">Checkout & Payment</h1>
    <p class="mt-1 text-sm text-slate-600">
      Complete your course purchase or activate Meekoo Premium All-Access via sandbox payment gateway.
    </p>

    <div v-if="errorMessage" role="alert" class="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      {{ errorMessage }}
    </div>

    <div v-if="activeOrder" class="mt-8 rounded-3xl border border-surface-border bg-white p-8 shadow-float space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Order Reference</p>
          <h2 class="text-2xl font-extrabold text-brand-900">{{ activeOrder.order_code }}</h2>
        </div>
        <span
          class="rounded-full px-4 py-1.5 text-xs font-bold uppercase"
          :class="{
            'bg-amber-100 text-amber-800': activeOrder.status === 'pending',
            'bg-emerald-100 text-emerald-800': activeOrder.status === 'paid',
            'bg-rose-100 text-rose-800': activeOrder.status === 'failed'
          }"
        >
          {{ activeOrder.status }}
        </span>
      </div>

      <ul class="divide-y divide-surface-border">
        <li
          v-for="item in activeOrder.items"
          :key="item.id"
          class="flex items-center justify-between py-3 text-sm"
        >
          <span class="font-semibold text-brand-900">{{ item.item_title }}</span>
          <span class="font-bold text-brand-900">{{ formatPrice(item.price, activeOrder.currency) }}</span>
        </li>
      </ul>

      <div class="flex items-center justify-between border-t border-surface-border pt-4 text-lg font-extrabold text-brand-900">
        <span>Total</span>
        <span>{{ formatPrice(activeOrder.total, activeOrder.currency) }}</span>
      </div>

      <div v-if="activeOrder.status === 'pending'" class="rounded-2xl border border-brand-200 bg-brand-50/70 p-6 space-y-4">
        <div class="flex items-center gap-2 text-brand-800">
          <ShieldCheck class="h-5 w-5" />
          <h3 class="text-base font-bold">Sandbox Payment Gateway</h3>
        </div>
        <p class="text-sm text-slate-600">
          Simulate gateway webhook confirmation. On <strong>Pay Now</strong>, enrollments or Premium subscription are activated transactionally.
        </p>
        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            :disabled="processing"
            class="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
            @click="handleSimulateGateway('paid')"
          >
            <CheckCircle2 class="h-4 w-4" />
            Simulate Payment Success (Paid)
          </button>
          <button
            type="button"
            :disabled="processing"
            class="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-rose-300 bg-white px-5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
            @click="handleSimulateGateway('failed')"
          >
            <XCircle class="h-4 w-4" />
            Simulate Failed
          </button>
        </div>
      </div>

      <div v-else-if="activeOrder.status === 'paid'" class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p class="text-sm font-semibold text-emerald-900">
          Payment confirmed ({{ activeOrder.gateway_ref }}). Your access is active!
        </p>
        <router-link
          to="/dashboard"
          class="inline-flex min-h-[44px] items-center rounded-xl bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700"
        >
          Go to Student Dashboard
        </router-link>
      </div>
    </div>

    <div v-else class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div class="lg:col-span-7 space-y-4">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            class="rounded-2xl border p-4 text-left transition"
            :class="orderType === 'course' ? 'border-brand-600 bg-brand-50' : 'border-surface-border bg-white'"
            @click="orderType = 'course'"
          >
            <p class="text-sm font-extrabold text-brand-900">Selected Courses ({{ ui.cartCount }})</p>
            <p class="mt-1 text-xs text-slate-600">Lifetime access to purchased items</p>
          </button>
          <button
            type="button"
            class="rounded-2xl border p-4 text-left transition"
            :class="orderType === 'subscription' ? 'border-brand-600 bg-brand-50' : 'border-surface-border bg-white'"
            @click="orderType = 'subscription'"
          >
            <div class="flex items-center gap-1.5 text-sm font-extrabold text-brand-900">
              <Crown class="h-4 w-4 text-amber-500" />
              <span>Premium Annual ($160/yr)</span>
            </div>
            <p class="mt-1 text-xs text-slate-600">Unlimited access to every published course</p>
          </button>
        </div>

        <div v-if="orderType === 'course'" class="rounded-2xl border border-surface-border bg-white p-6 shadow-card">
          <h2 class="text-lg font-extrabold text-brand-900 mb-4">Your Cart</h2>
          <div v-if="ui.cartItems.length === 0" class="py-6 text-center space-y-3">
            <p class="text-sm text-slate-500">Your cart is currently empty.</p>
            <router-link
              to="/courses"
              class="inline-flex min-h-[44px] items-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white"
            >
              Browse Courses
            </router-link>
          </div>
          <ul v-else class="divide-y divide-surface-border">
            <li
              v-for="item in ui.cartItems"
              :key="item.id"
              class="flex items-center justify-between gap-4 py-3.5"
            >
              <div class="flex items-center gap-3 min-w-0">
                <img
                  :src="item.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80'"
                  :alt="item.title"
                  class="h-12 w-16 rounded-lg object-cover shrink-0"
                />
                <div class="min-w-0">
                  <p class="truncate text-sm font-bold text-brand-900">{{ item.title }}</p>
                  <p class="text-xs text-slate-500">{{ item.mentor_name }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <span class="text-sm font-extrabold text-brand-900">{{ formatPrice(item.price, item.currency) }}</span>
                <button
                  type="button"
                  class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Remove from cart"
                  @click="ui.removeFromCart(item.id)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </li>
          </ul>
        </div>

        <div v-else class="rounded-2xl border border-brand-200 bg-brand-50/50 p-6 space-y-3">
          <div class="flex items-center gap-2 text-brand-800">
            <Crown class="h-5 w-5 text-amber-500" />
            <h2 class="text-lg font-extrabold">Meekoo Premium Annual Membership</h2>
          </div>
          <p class="text-sm text-slate-600">
            Unlock all 90+ categories, unlimited course video players, live mentor sessions, personalized learning roadmaps, and verified certificates for 12 months.
          </p>
          <div v-if="auth.hasActiveSubscription" class="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-900">
            You already have an active Premium membership. Completing checkout below will extend your access by +12 months.
          </div>
        </div>
      </div>

      <aside class="lg:col-span-5">
        <div class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-5">
          <h2 class="text-lg font-extrabold text-brand-900">Order Summary</h2>

          <div>
            <label for="pay-method" class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Payment Method (Sandbox)
            </label>
            <select id="pay-method" v-model="paymentMethod" class="min-h-[44px] w-full rounded-xl border border-surface-border px-3 text-sm">
              <option value="sandbox_card">Credit / Debit Card (Stripe Sandbox)</option>
              <option value="sandbox_paypal">PayPal Sandbox</option>
            </select>
          </div>

          <div class="flex items-center justify-between border-t border-surface-border pt-4 text-lg font-extrabold text-brand-900">
            <span>Total Due</span>
            <span>{{ orderType === 'subscription' ? '$160' : formatPrice(ui.cartTotal, 'USD') }}</span>
          </div>

          <button
            type="button"
            :disabled="processing || (orderType === 'course' && ui.cartItems.length === 0)"
            class="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50 transition"
            @click="handleCreateOrder"
          >
            <CreditCard class="h-4 w-4" />
            <span>{{ processing ? 'Creating Order...' : 'Proceed to Sandbox Payment' }}</span>
          </button>
          <p class="text-[11px] text-slate-500 text-center">
            Card details are never stored on Meekoo servers.
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>
