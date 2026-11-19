import api from './api.js';

export const publicService = {
  async getLanding() {
    const { data } = await api.get('/landing');
    return data;
  },
  async getWorkPermitMeta() {
    const { data } = await api.get('/permits/work-permit/meta');
    return data;
  },
  async submitWorkPermit(payload) {
    const { data } = await api.post('/permits/work-permit', payload);
    return data;
  }
};
