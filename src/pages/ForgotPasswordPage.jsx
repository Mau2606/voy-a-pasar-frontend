import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { forgotPassword } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      {/* Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 mb-4">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">¡Voy a Pasar!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Recuperar contraseña</p>
        </div>

        <div className="card p-8">
          {sent ? (
            /* ── Success state ── */
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle size={56} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">¡Revisa tu correo!</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Si <strong>{email}</strong> está registrado, recibirás un enlace para restablecer
                tu contraseña. El enlace es válido por <strong>1 hora</strong>.
              </p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2 mt-4">
                <ArrowLeft size={16} /> Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            /* ── Request form ── */
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="input-forgot-email"
                    type="email"
                    placeholder="Correo electrónico"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
                <button
                  id="btn-send-reset"
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" /> : null}
                  Enviar enlace de recuperación
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
                <Link to="/login" className="text-violet-500 hover:underline flex items-center justify-center gap-1">
                  <ArrowLeft size={12} /> Volver al inicio de sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
