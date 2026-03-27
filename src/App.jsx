import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PrivateRoute, AdminRoute } from './components/ProtectedRoutes';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import CatalogPage from './pages/CatalogPage';
import ManualDetailPage from './pages/ManualDetailPage';
import QuizPage from './pages/QuizPage';
import FinalExamPage from './pages/FinalExamPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-950 transition-colors duration-300">
            <Navbar />
            <main className="flex-1">
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

                {/* User routes */}
                <Route path="/dashboard" element={
                  <PrivateRoute><UserDashboard /></PrivateRoute>
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
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
