import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEMO_USER_1_ID } from '../seed-content/demo-users';
import { openUserDb, UserDb } from '../data/local/db';
import { seedDemoUser } from '../data/local/seed';
import type { ProfileRecord, GoalRecord, PreferenceRecord } from '../data/local/schema';

export type NavTab = 'today' | 'plan' | 'training' | 'exercises' | 'nutrition' | 'progress' | 'profile' | 'timer';

interface AppContextValue {
  activeUserId: string;
  setActiveUserId: (id: string) => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isMayaOpen: boolean;
  setIsMayaOpen: (open: boolean) => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  toggleTheme: () => void;
  db: UserDb;
  profile: ProfileRecord | null;
  goal: GoalRecord | null;
  preferences: PreferenceRecord | null;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeUserId, setActiveUserIdState] = useState<string>(() => {
    return localStorage.getItem('fe_active_user_id') || DEMO_USER_1_ID;
  });
  const [activeTab, setActiveTab] = useState<NavTab>('today');
  const [isMayaOpen, setIsMayaOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isLoading, setIsLoading] = useState(true);

  const [db, setDb] = useState<UserDb>(() => openUserDb(activeUserId));
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [goal, setGoal] = useState<GoalRecord | null>(null);
  const [preferences, setPreferences] = useState<PreferenceRecord | null>(null);

  // Cargar y asegurar seed inicial para el usuario
  const loadUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const userDb = openUserDb(userId);
      setDb(userDb);
      await seedDemoUser(userId);

      const p = await userDb.profiles.get(userId);
      const g = (await userDb.goals.toArray()).find((x) => x.active && !x.deletedAt) || null;
      const pref = (await userDb.preferences.toArray())[0] || null;

      setProfile(p || null);
      setGoal(g || null);
      setPreferences(pref || null);
    } catch (err) {
      console.error('Error cargando datos de usuario:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('fe_active_user_id', activeUserId);
    loadUser(activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setActiveUserId = (id: string) => {
    setActiveUserIdState(id);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const refreshData = async () => {
    await loadUser(activeUserId);
  };

  return (
    <AppContext.Provider
      value={{
        activeUserId,
        setActiveUserId,
        activeTab,
        setActiveTab,
        isMayaOpen,
        setIsMayaOpen,
        theme,
        setTheme,
        toggleTheme,
        db,
        profile,
        goal,
        preferences,
        refreshData,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp debe usarse dentro de un AppProvider');
  return context;
}
