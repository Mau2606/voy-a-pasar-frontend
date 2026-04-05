import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PrivateRoute, AdminRoute } from './components/ProtectedRoutes';
import Navbar from './components/Navbar';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
// Each page is loaded on-demand only when the user navigates to it.
// This reduces the initial JavaScript bundle size by ~30-50%.
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const ManualDetailPage = lazy(() => import('./pages/ManualDetailPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const FinalExamPage = lazy(() => import('./pages/FinalExamPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// ── Loading fallback ──────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-950 transition-colors duration-300">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />

                  {/* Admin routes */}
                  <Route path="/admin" element={
                    <AdminRoute><AdminDashboard /></AdminRoute>
                  } />

                  <Route path="/dashboard" element={
                    <PrivateRoute><UserDashboard /></PrivateRoute>
                  } />
                  <Route path="/profile" element={
                    <PrivateRoute><ProfilePage /></PrivateRoute>
                  } />
                  <Route path="/catalog" element={
                    <PrivateRoute><CatalogPage /></PrivateRoute>
                  } />
                  <Route path="/manual/:manualId" element={
                    <PrivateRoute><ManualDetailPage /></PrivateRoute>
                  } />
                  <Route path="/quiz/:chapterId" element={
                    <PrivateRoute><QuizPage /></PrivateRoute>
                  } />
                  <Route path="/final-exam/:manualId" element={
                    <PrivateRoute><FinalExamPage /></PrivateRoute>
                  } />

                  {/* Catch-all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
