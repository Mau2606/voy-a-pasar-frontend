import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // IMPORTANT: Allows browser to send HttpOnly cookies
});

// Since tokens are now in HttpOnly cookies, we no longer need the request interceptor
// that manually attached the Bearer token from localStorage.

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Instead of forcing a hard redirect that destroys React state,
      // the AuthContext should handle clearing state if /me fails.
      // But we can trigger a soft event if needed. For now, we just reject.
    }
    return Promise.reject(err);
  },
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const logoutUser = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const forgotPassword = (email, captchaToken) => api.post('/auth/forgot-password', { email, captchaToken });
export const resetPassword = (token, newPassword) => api.post('/auth/reset-password', { token, newPassword });
export const changePassword = (currentPassword, newPassword) => api.put('/auth/password', { currentPassword, newPassword });

// ── Admin – Users ─────────────────────────────────────────────────────────────
export const getUsers = (page = 0, size = 15) => api.get('/admin/users', { params: { page, size } });
export const getUsersStats = () => api.get('/admin/users/stats');
export const createUser = (data) => api.post('/admin/users', data);
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const approveUser = (id) => api.put(`/admin/memberships/${id}/approve`);
export const activateMembership = (id, type) => api.put(`/admin/memberships/${id}/activate?type=${type}`);
export const deactivateMembership = (id) => api.put(`/admin/memberships/${id}/deactivate`);

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
export const getChapterUnlockStatus = (manualId) => api.get(`/chapters/manual/${manualId}/unlock-status`);
export const toggleChapterRead = (chapterId, isRead) => api.post(`/chapters/${chapterId}/read-status?isRead=${isRead}`);
export const uploadChapterPdf = (chapterId, file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post(`/chapters/${chapterId}/pdf`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

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
export const telemetryLogin = () => api.post('/telemetry/session/login');
export const telemetryLogout = () => api.put('/telemetry/session/logout');
export const telemetryQuizAttempt = (data) => api.post('/telemetry/quiz-attempt', data);
export const getMySessions = (page = 0, size = 15) => api.get('/telemetry/my-sessions', { params: { page, size } });

// ── Reports ───────────────────────────────────────────────────────────────────
export const createReport = (data) => api.post('/reports/questions', data);
export const getPendingReports = () => api.get('/reports/admin/pending');
export const getAllReports = () => api.get('/reports/admin/all');
export const resolveReport = (id, data) => api.put(`/reports/admin/${id}/resolve`, data);

export default api;
