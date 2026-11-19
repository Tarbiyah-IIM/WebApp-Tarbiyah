import api from './api.js';

export const authService = {
  async login(payload) {
    const { data } = await api.post('/auth/login', payload);
    return data;
  },
  async refresh() {
    const { data } = await api.post('/auth/refresh');
    return data;
  },
  async logout() {
    const { data } = await api.post('/auth/logout');
    return data;
  },
  async forgotPassword(email) {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },
  async resetPassword(payload) {
    const { data } = await api.post('/auth/reset-password', payload);
    return data;
  },
  async getMe() {
    const { data } = await api.get('/me');
    return data;
  },
  async updateMe(payload) {
    const { data } = await api.patch('/me', payload);
    return data;
  }
};
