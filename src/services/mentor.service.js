import api from './api.js';

export const mentorService = {
  async getOverview() {
    const { data } = await api.get('/mentor/overview');
    return data;
  },
  async getCourseCurriculum(courseId) {
    const { data } = await api.get(`/mentor/courses/${courseId}/curriculum`);
    return data;
  },
  async createCourse(payload) {
    const { data } = await api.post('/mentor/courses', payload);
    return data;
  },
  async updateCourse(id, payload) {
    const { data } = await api.patch(`/mentor/courses/${id}`, payload);
    return data;
  },
  async submitCourseForReview(id) {
    const { data } = await api.post(`/mentor/courses/${id}/submit`);
    return data;
  },
  async createSection(payload) {
    const { data } = await api.post('/mentor/sections', payload);
    return data;
  },
  async updateSection(id, payload) {
    const { data } = await api.patch(`/mentor/sections/${id}`, payload);
    return data;
  },
  async deleteSection(id) {
    const { data } = await api.delete(`/mentor/sections/${id}`);
    return data;
  },
  async createLesson(payload) {
    const { data } = await api.post('/mentor/lessons', payload);
    return data;
  },
  async updateLesson(id, payload) {
    const { data } = await api.patch(`/mentor/lessons/${id}`, payload);
    return data;
  },
  async deleteLesson(id) {
    const { data } = await api.delete(`/mentor/lessons/${id}`);
    return data;
  },
  async createLiveSession(payload) {
    const { data } = await api.post('/mentor/live-sessions', payload);
    return data;
  },
  async deleteLiveSession(id) {
    const { data } = await api.delete(`/mentor/live-sessions/${id}`);
    return data;
  }
};
