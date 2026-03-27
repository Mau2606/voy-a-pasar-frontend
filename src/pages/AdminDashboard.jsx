import { useState } from 'react';
import UsersManager from './admin/UsersManager';
import ManualsManager from './admin/ManualsManager';
import { BookOpen, Users } from 'lucide-react';

function TabButton({ active, onClick, icon: Icon, label, id }) {
  return (
    <button id={id} onClick={onClick}
            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'}`}>
      <Icon size={18} /> {label}
    </button>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('manuals');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Panel de Administración</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Gestiona el contenido académico y los usuarios del sistema.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <TabButton 
          id="tab-manuals" 
          active={activeTab === 'manuals'} 
          onClick={() => setActiveTab('manuals')} 
          icon={BookOpen} 
          label="Cursos y Material (Drill-down)" 
        />
        <TabButton 
          id="tab-users" 
          active={activeTab === 'users'} 
          onClick={() => setActiveTab('users')} 
          icon={Users} 
          label="Gestión de Usuarios" 
        />
      </div>

      {/* RENDER ACTIVE MODULE */}
      <div className="animate-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'manuals' ? <ManualsManager /> : <UsersManager />}
      </div>
    </div>
  );
}
