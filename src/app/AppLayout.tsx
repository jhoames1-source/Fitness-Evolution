import React from 'react';
import { useApp, NavTab } from './AppContext';
import { TodayDashboard } from '../features/dashboard/TodayDashboard';
import { PlanScreen } from '../features/plan/PlanScreen';
import { TrainingScreen } from '../features/training/TrainingScreen';
import { ExercisesScreen } from '../features/training/ExercisesScreen';
import { NutritionScreen } from '../features/nutrition/NutritionScreen';
import { ProgressScreen } from '../features/progress/ProgressScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';

export const AppLayout: React.FC = () => {
  const { activeTab, setActiveTab, profile, theme, toggleTheme, isLoading } = useApp();

  const navItems: { tab: NavTab; label: string; icon: string }[] = [
    { tab: 'today', label: 'Inicio', icon: '🏠' },
    { tab: 'plan', label: 'Plan', icon: '📋' },
    { tab: 'training', label: 'Entreno', icon: '🏋️' },
    { tab: 'exercises', label: 'Ejercicios', icon: '📚' },
    { tab: 'nutrition', label: 'Nutrición', icon: '🥗' },
    { tab: 'progress', label: 'Progreso', icon: '📈' },
    { tab: 'profile', label: 'Perfil', icon: '👤' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400 font-bold text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Iniciando Fitness Evolution...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100">
      {/* 1. SIDEBAR PARA ESCRITORIO (md y superior) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900/90 p-5 flex-shrink-0">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-emerald-500/20">
            FE
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-wider text-white">FITNESS EVOLUTION</h1>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest block">
              Multi-Plataforma
            </span>
          </div>
        </div>

        {/* Menú de Navegación Lateral */}
        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/10'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tarjeta de usuario activo en sidebar */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
              {profile?.firstName?.[0] ?? 'U'}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white leading-tight">
                {profile?.firstName}
              </div>
              <div className="text-[10px] text-slate-400">{profile?.initialWeightKg} kg</div>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Alternar tema claro/oscuro"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </aside>

      {/* 2. ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 overflow-y-auto">
        {/* Cabecera superior móvil */}
        <div className="flex md:hidden items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center font-black text-slate-950 text-xs">
              FE
            </div>
            <span className="font-extrabold text-sm text-white tracking-wide">
              FITNESS EVOLUTION
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Renderizado de pantalla según pestaña activa */}
        {activeTab === 'today' && <TodayDashboard />}
        {activeTab === 'plan' && <PlanScreen />}
        {activeTab === 'training' && <TrainingScreen />}
        {activeTab === 'exercises' && <ExercisesScreen />}
        {activeTab === 'nutrition' && <NutritionScreen />}
        {activeTab === 'progress' && <ProgressScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </main>

      {/* 3. BARRA DE NAVEGACIÓN INFERIOR MÓVIL (Regla 59: accesible a una mano) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
