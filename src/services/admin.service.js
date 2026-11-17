import api from './api.js';

export const adminService = {
  async getOverview() {
    const { data } = await api.get('/admin/overview');
    return data;
  },
  async listUsers() {
    const { data } = await api.get('/admin/users');
    return data;
  },
  async updateUser(id, payload) {
    const { data } = await api.patch(`/admin/users/${id}`, payload);
    return data;
  },
  async listOrders() {
    const { data } = await api.get('/admin/orders');
    return data;
  },
  async updateOrderStatus(id, status) {
    const { data } = await api.patch(`/admin/orders/${id}`, { status });
    return data;
  },
  async listCourses() {
    const { data } = await api.get('/admin/courses');
    return data;
  },
  async getCourseCurriculum(id) {
    const { data } = await api.get(`/admin/courses/${id}/curriculum`);
    return data;
  },
  async createCourse(payload) {
    const { data } = await api.post('/admin/courses', payload);
    return data;
  },
  async updateCourse(id, payload) {
    const { data } = await api.patch(`/admin/courses/${id}`, payload);
    return data;
  },
  async deleteCourse(id) {
    const { data } = await api.delete(`/admin/courses/${id}`);
    return data;
  },
  async createSection(payload) {
    const { data } = await api.post('/admin/sections', payload);
    return data;
  },
  async deleteSection(id) {
    const { data } = await api.delete(`/admin/sections/${id}`);
    return data;
  },
  async createLesson(payload) {
    const { data } = await api.post('/admin/lessons', payload);
    return data;
  },
  async deleteLesson(id) {
    const { data } = await api.delete(`/admin/lessons/${id}`);
    return data;
  },
  async listCategories() {
    const { data } = await api.get('/admin/categories');
    return data;
  },
  async createCategory(payload) {
    const { data } = await api.post('/admin/categories', payload);
    return data;
  },
  async updateCategory(id, payload) {
    const { data } = await api.patch(`/admin/categories/${id}`, payload);
    return data;
  },
  async deleteCategory(id) {
    const { data } = await api.delete(`/admin/categories/${id}`);
    return data;
  },
  async listMentors() {
    const { data } = await api.get('/admin/mentors');
    return data;
  },
  async createMentor(payload) {
    const { data } = await api.post('/admin/mentors', payload);
    return data;
  },
  async updateMentor(id, payload) {
    const { data } = await api.patch(`/admin/mentors/${id}`, payload);
    return data;
  },
  async deleteMentor(id) {
    const { data } = await api.delete(`/admin/mentors/${id}`);
    return data;
  },
  async listTestimonials() {
    const { data } = await api.get('/admin/testimonials');
    return data;
  },
  async createTestimonial(payload) {
    const { data } = await api.post('/admin/testimonials', payload);
    return data;
  },
  async updateTestimonial(id, payload) {
    const { data } = await api.patch(`/admin/testimonials/${id}`, payload);
    return data;
  },
  async deleteTestimonial(id) {
    const { data } = await api.delete(`/admin/testimonials/${id}`);
    return data;
  },
  async listFaqs() {
    const { data } = await api.get('/admin/faqs');
    return data;
  },
  async createFaq(payload) {
    const { data } = await api.post('/admin/faqs', payload);
    return data;
  },
  async updateFaq(id, payload) {
    const { data } = await api.patch(`/admin/faqs/${id}`, payload);
    return data;
  },
  async deleteFaq(id) {
    const { data } = await api.delete(`/admin/faqs/${id}`);
    return data;
  },
  async listStats() {
    const { data } = await api.get('/admin/stats');
    return data;
  },
  async createStat(payload) {
    const { data } = await api.post('/admin/stats', payload);
    return data;
  },
  async updateStat(id, payload) {
    const { data } = await api.patch(`/admin/stats/${id}`, payload);
    return data;
  },
  async deleteStat(id) {
    const { data } = await api.delete(`/admin/stats/${id}`);
    return data;
  },
  async listFeatures() {
    const { data } = await api.get('/admin/features');
    return data;
  },
  async createFeature(payload) {
    const { data } = await api.post('/admin/features', payload);
    return data;
  },
  async updateFeature(id, payload) {
    const { data } = await api.patch(`/admin/features/${id}`, payload);
    return data;
  },
  async deleteFeature(id) {
    const { data } = await api.delete(`/admin/features/${id}`);
    return data;
  },
  async listPartners() {
    const { data } = await api.get('/admin/partners');
    return data;
  },
  async createPartner(payload) {
    const { data } = await api.post('/admin/partners', payload);
    return data;
  },
  async updatePartner(id, payload) {
    const { data } = await api.patch(`/admin/partners/${id}`, payload);
    return data;
  },
  async deletePartner(id) {
    const { data } = await api.delete(`/admin/partners/${id}`);
    return data;
  },
  async getSettings() {
    const { data } = await api.get('/admin/settings');
    return data;
  },
  async updateSettings(payload) {
    const { data } = await api.patch('/admin/settings', payload);
    return data;
  },
  async listLiveSessions() {
    const { data } = await api.get('/admin/live-sessions');
    return data;
  },
  async createLiveSession(payload) {
    const { data } = await api.post('/admin/live-sessions', payload);
    return data;
  },
  async deleteLiveSession(id) {
    const { data } = await api.delete(`/admin/live-sessions/${id}`);
    return data;
  },
  async uploadImage(file) {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post('/admin/uploads', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  }
};
