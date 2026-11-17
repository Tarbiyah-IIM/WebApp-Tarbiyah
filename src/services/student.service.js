import api from './api.js';

export const studentService = {
  async getMyCourses() {
    const { data } = await api.get('/me/courses');
    return data;
  },
  async getMyOrders() {
    const { data } = await api.get('/me/orders');
    return data;
  },
  async getMyCertificates() {
    const { data } = await api.get('/me/certificates');
    return data;
  },
  async getMySubscription() {
    const { data } = await api.get('/subscriptions/me');
    return data;
  },
  async toggleAutoRenew(autoRenew) {
    const { data } = await api.post('/subscriptions/auto-renew', { autoRenew });
    return data;
  },
  async createOrder(payload) {
    const { data } = await api.post('/orders', payload);
    return data;
  },
  async getOrderDetail(orderId) {
    const { data } = await api.get(`/orders/${orderId}`);
    return data;
  },
  async simulatePayment(orderId, outcome = 'paid') {
    const { data } = await api.post(`/orders/${orderId}/simulate-payment`, { outcome });
    return data;
  },
  async getLearnCourse(courseId) {
    const { data } = await api.get(`/courses/${courseId}/learn`);
    return data;
  },
  async completeLesson(lessonId) {
    const { data } = await api.post(`/lessons/${lessonId}/complete`);
    return data;
  },
  async submitReview(courseId, payload) {
    const { data } = await api.post(`/courses/${courseId}/reviews`, payload);
    return data;
  },
  async getLiveSessions(courseId = null) {
    const { data } = await api.get('/live-sessions', {
      params: courseId ? { courseId } : {}
    });
    return data;
  },
  async registerLiveSession(sessionId) {
    const { data } = await api.post(`/live-sessions/${sessionId}/register`);
    return data;
  },
  async unregisterLiveSession(sessionId) {
    const { data } = await api.delete(`/live-sessions/${sessionId}/register`);
    return data;
  },
  async getCommunityPosts(courseId) {
    const { data } = await api.get(`/courses/${courseId}/community`);
    return data;
  },
  async createCommunityPost(courseId, payload) {
    const { data } = await api.post(`/courses/${courseId}/community`, payload);
    return data;
  },
  async deleteCommunityPost(postId) {
    const { data } = await api.delete(`/community/${postId}`);
    return data;
  },
  async getLearningPaths() {
    const { data } = await api.get('/learning-paths');
    return data;
  },
  async generateLearningPath(payload) {
    const { data } = await api.post('/learning-paths/generate', payload);
    return data;
  },
  async reorderLearningPath(pathId, orderedItemIds) {
    const { data } = await api.patch(`/learning-paths/${pathId}`, { orderedItemIds });
    return data;
  },
  async deleteLearningPath(pathId) {
    const { data } = await api.delete(`/learning-paths/${pathId}`);
    return data;
  }
};
