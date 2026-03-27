import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, newPassword) => api.post('/auth/reset-password', { token, newPassword });

// ── Admin – Users ─────────────────────────────────────────────────────────────
export const getUsers = (page = 0, size = 10) => api.get('/admin/users', { params: { page, size, sort: 'id,asc' } });
export const createUser = (data) => api.post('/admin/users', data);
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const approveUser = (id) => api.put(`/admin/users/${id}/approve`);
export const suspendUser = (id) => api.put(`/admin/users/${id}/suspend`);

// ── Manuals ───────────────────────────────────────────────────────────────────
export const getManuals = () => api.get('/manuals');
export const getManual = (id) => api.get(`/manuals/${id}`);
export const createManual = (data) => api.post('/manuals', data);
export const updateManual = (id, data) => api.put(`/manuals/${id}`, data);
export const deleteManual = (id) => api.delete(`/manuals/${id}`);
export const uploadManualPdf = (manualId, file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post(`/manuals/${manualId}/pdf`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
// ── Enrollments ───────────────────────────────────────────────────────────────
export const getMyEnrollments = () => api.get('/enrollments/my');
export const enrollInManual = (manualId) => api.post(`/enrollments/${manualId}`);

// ── Chapters ──────────────────────────────────────────────────────────────────
export const getChapters = () => api.get('/chapters');
export const getChaptersByManual = (manualId) => api.get(`/chapters/manual/${manualId}`);
export const getChapter = (id) => api.get(`/chapters/${id}`);
export const createChapter = (data) => api.post('/chapters', data);
export const updateChapter = (id, data) => api.put(`/chapters/${id}`, data);
export const deleteChapter = (id) => api.delete(`/chapters/${id}`);
export const getChapterUnlockStatus = (manualId) =>
  api.get(`/chapters/manual/${manualId}/unlock-status`);

// ── Questions ─────────────────────────────────────────────────────────────────
export const getQuestions = () => api.get('/questions');
export const getQuestionsByChapter = (chapterId, limit) =>
  api.get(`/questions/chapter/${chapterId}`, { params: limit ? { limit } : {} });
export const createQuestion = (data) => api.post('/questions', data);
export const updateQuestion = (id, data) => api.put(`/questions/${id}`, data);
export const deleteQuestion = (id) => api.delete(`/questions/${id}`);

// ── Progress ──────────────────────────────────────────────────────────────────
export const getMyProgress = () => api.get('/progress/me');
export const saveProgress = (data) => api.post('/progress', data);

// ── Final Exam ────────────────────────────────────────────────────────────────
export const getFinalExam = (manualId) => api.get(`/exams/manual/${manualId}`);
export const submitFinalExam = (data) => api.post('/exams/submit', data);

// ── Payments ──────────────────────────────────────────────────────────────────
export const createPaymentPreference = () => api.post('/payments/preference');

// ── Telemetry ─────────────────────────────────────────────────────────────────
export const postSessionLog = (data) => api.post('/telemetry/session', data);
export const postQuestionTime = (data) => api.post('/telemetry/question-time', data);
export const postQuestionTimesBatch = (data) => api.post('/telemetry/question-times/batch', data);

export default api;
