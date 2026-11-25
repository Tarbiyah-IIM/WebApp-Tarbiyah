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
  async listNewsCategories() {
    const { data } = await api.get('/admin/news-categories');
    return data;
  },
  async createNewsCategory(payload) {
    const { data } = await api.post('/admin/news-categories', payload);
    return data;
  },
  async deleteNewsCategory(id) {
    const { data } = await api.delete(`/admin/news-categories/${id}`);
    return data;
  },
  async listAgendas() {
    const { data } = await api.get('/admin/agendas');
    return data;
  },
  async createAgenda(payload) {
    const { data } = await api.post('/admin/agendas', payload);
    return data;
  },
  async updateAgenda(id, payload) {
    const { data } = await api.patch(`/admin/agendas/${id}`, payload);
    return data;
  },
  async deleteAgenda(id) {
    const { data } = await api.delete(`/admin/agendas/${id}`);
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
  async uploadImage(file) {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post('/admin/uploads', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  async deleteMediaUpload(id) {
    const { data } = await api.delete(`/admin/uploads/${id}`);
    return data;
  },
  async cleanupMediaByUrl(url) {
    const match = String(url || '')
      .trim()
      .match(/^\/api\/v1\/media\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
    if (!match) return;
    try {
      await api.delete(`/admin/uploads/${match[1]}`);
    } catch {}
  }
};
