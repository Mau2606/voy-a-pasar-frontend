import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, Trophy, Clock, BarChart3,
  ChevronRight, Sparkles, Shield, Zap,
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Manuales Completos',
    desc: 'Accede a todos los capítulos con visor PDF integrado y navegación inteligente.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Trophy,
    title: 'Exámenes Simulados',
    desc: '30 preguntas aleatorias, temporizador de 40 minutos. Idéntico al examen real.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'Seguimiento de Progreso',
    desc: 'Visualiza tu avance por capítulo, identifica tus áreas débiles y mejora.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Clock,
    title: 'Practica a tu Ritmo',
    desc: 'Cuestionarios por capítulo con explicaciones detalladas y referencias al manual.',
    gradient: 'from-violet-500 to-purple-500',
  },
];

const stats = [
  { value: '500+', label: 'Preguntas' },
  { value: '95%', label: 'Tasa de Aprobación' },
  { value: '24/7', label: 'Acceso' },
  { value: '40 min', label: 'Examen Simulado' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 dark:from-violet-900 dark:via-indigo-900 dark:to-purple-950" />
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-violet-300/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white/90 text-sm font-medium mb-6">
              <Sparkles size={16} className="text-amber-300" />
              Plataforma de Estudio #1 para tu Examen
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Aprueba tu examen con{' '}
              <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                ¡Voy a Pasar!
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              Prepárate con preguntas reales, exámenes simulados cronometrados
              y explicaciones detalladas. Todo lo que necesitas para aprobar, en un solo lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <button
                  id="hero-go-dashboard"
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-4 rounded-2xl bg-white text-violet-700 font-bold text-lg shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                >
                  Ir al Dashboard
                  <ChevronRight size={20} className="inline ml-2" />
                </button>
              ) : (
                <>
                  <button
                    id="hero-register"
                    onClick={() => navigate('/login')}
                    className="px-8 py-4 rounded-2xl bg-white text-violet-700 font-bold text-lg shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                  >
                    Comenzar Gratis
                    <ChevronRight size={20} className="inline ml-2" />
                  </button>
                  <button
                    id="hero-login"
                    onClick={() => navigate('/login')}
                    className="px-8 py-4 rounded-2xl border-2 border-white/30 text-white font-bold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                  >
                    Ya tengo cuenta
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────── */}
      <section className="relative -mt-8 z-10 max-w-4xl mx-auto px-4">
        <div className="glass rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                {s.value}
              </div>
              <div className="text-sm text-slate-500 dark:text-gray-400 font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
            Todo lo que necesitas para{' '}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              aprobar
            </span>
          </h2>
          <p className="text-slate-500 dark:text-gray-400 max-w-xl mx-auto">
            Herramientas diseñadas para maximizar tu estudio y asegurar tu éxito en el examen.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card p-6 group hover:scale-[1.01] transition-transform duration-300">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${f.gradient} shadow-lg mb-4`}>
                <f.icon size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{f.title}</h3>
              <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Premium CTA ───────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-10 text-center text-white">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-sm font-medium mb-6">
              <Shield size={16} />
              Plan Premium
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Acceso total por 1 mes
            </h2>
            <p className="text-white/80 max-w-lg mx-auto mb-8">
              Todos los manuales, preguntas ilimitadas, exámenes simulados y
              seguimiento completo de tu progreso. Sin restricciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                id="cta-premium"
                onClick={() => navigate('/login')}
                className="px-8 py-4 rounded-2xl bg-white text-violet-700 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center gap-2"
              >
                <Zap size={20} />
                Obtener Premium
              </button>
              <span className="text-white/60 text-sm">
                Versión gratuita disponible con 3 preguntas por capítulo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-gray-800 py-8 text-center text-sm text-slate-400 dark:text-gray-500">
        © {new Date().getFullYear()} ¡Voy a Pasar! Todos los derechos reservados.
      </footer>
    </div>
  );
}
