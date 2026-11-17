import api from './api.js';

export const publicService = {
  async getLanding() {
    const { data } = await api.get('/landing');
    return data;
  },
  async getCategories() {
    const { data } = await api.get('/categories');
    return data;
  },
  async getMentors() {
    const { data } = await api.get('/mentors');
    return data;
  },
  async getCourses(params = {}) {
    const { data } = await api.get('/courses', { params });
    return data;
  },
  async getCourseDetail(slug) {
    const { data } = await api.get(`/courses/${slug}`);
    return data;
  },
  async subscribe(email, source = 'footer') {
    const { data } = await api.post('/subscribers', { email, source });
    return data;
  },
  async verifyCertificate(code) {
    const { data } = await api.get(`/certificates/verify/${encodeURIComponent(code)}`);
    return data;
  }
};
