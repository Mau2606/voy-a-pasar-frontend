import { useState, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import ReCaptcha, { resetCaptchaRef } from '../components/ReCaptcha';


export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const [isLogin, setIsLogin] = useState(searchParams.get('tab') !== 'register');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');   // ← inline error banner
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [captchaToken, setCaptchaToken] = useState('');
  const captchaRef = useRef(null);

  const handleChange = (e) => {
    setErrorMsg('');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      if (isLogin) {
        const userData = await login(form.email, form.password);
        toast.success(`¡Bienvenido, ${userData.name}!`);
        navigate(userData.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true });
      } else {
        await register(form.name, form.email, form.password, form.phone, captchaToken);
        toast.success('Registro exitoso. Tu cuenta está pendiente de aceptación por el administrador.');
        setIsLogin(true);
        setForm({ ...form, password: '' });
        setCaptchaToken('');
        resetCaptchaRef(captchaRef);
      }
    } catch (err) {
      // Show inline error + centered toast
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error  ||
        (err.response?.status === 401 ? 'Credenciales inválidas. Verifica tu email y contraseña.' : null) ||
        (err.response?.status === 403 ? 'Acceso denegado.' : null) ||
        (err.message === 'Network Error' ? 'No se puede conectar al servidor. Verifica que el backend esté activo.' : null) ||
        'Ocurrió un error inesperado. Inténtalo de nuevo.';
      setErrorMsg(msg);
      toast.error(msg);
      resetCaptchaRef(captchaRef);
      setCaptchaToken('');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (toLogin) => {
    setIsLogin(toLogin);
    setErrorMsg('');
    setForm({ name: '', email: '', password: '', phone: '' });
    setCaptchaToken('');
    resetCaptchaRef(captchaRef);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 mb-4">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">¡Voy a Pasar!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Plataforma de Estudio</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-6">
            <button onClick={() => switchTab(true)} id="tab-login"
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-white dark:bg-gray-600 shadow text-violet-600 dark:text-violet-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
              Iniciar Sesión
            </button>
            <button onClick={() => switchTab(false)} id="tab-register"
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-white dark:bg-gray-600 shadow text-violet-600 dark:text-violet-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
              Registrarse
            </button>
          </div>

          {/* ── Inline error banner ── */}
          {errorMsg && (
            <div className="flex items-start gap-3 mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-4">
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input id="input-name" name="name" type="text" placeholder="Nombre completo" required
                         value={form.name} onChange={handleChange}
                         className="input-field pl-10" />
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">+56</span>
                  <input id="input-phone" name="phone" type="tel" placeholder="9 1234 5678" required
                         pattern="^9\d{8}$" title="Debe contener 9 dígitos y empezar con 9"
                         value={form.phone} onChange={handleChange}
                         className="input-field pl-12" />
                </div>
              </div>
            )}
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input id="input-email" name="email" type="email" placeholder="Correo electrónico" required
                     value={form.email} onChange={handleChange}
                     className="input-field pl-10" />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input id="input-password" name="password" type={showPass ? 'text' : 'password'}
                     placeholder="Contraseña" required minLength={6}
                     value={form.password} onChange={handleChange}
                     className="input-field pl-10 pr-10" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Forgot password link */}
            {isLogin && (
              <div className="flex justify-end -mt-1">
                <Link to="/forgot-password" className="text-xs text-violet-500 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            )}

            {/* reCAPTCHA — only for register */}
            {!isLogin && (
              <div className="pt-1">
                <ReCaptcha
                  captchaRef={captchaRef}
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken('')}
                />
              </div>
            )}

            <button id="btn-submit" type="submit" disabled={loading || (!isLogin && !captchaToken)}
                    className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
              ) : null}
              {isLogin ? 'Ingresar' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
