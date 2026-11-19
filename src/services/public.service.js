import api from './api.js';

export const publicService = {
  async getLanding() {
    const { data } = await api.get('/landing');
    return data;
  }
};
