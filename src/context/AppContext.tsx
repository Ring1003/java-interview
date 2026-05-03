import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { QuestionTree, ProgressStats, Category } from '../types';
import { loadCategoryData, preloadCategory } from '../services/questionData';
import { getDeviceId } from '../utils/device';
import { fetchProgress, updateProgress as apiUpdateProgress } from '../services/progressApi';

interface AppContextType {
  /** Root-level question trees for current category (with children pre-loaded) */
  rootQuestions: QuestionTree[];
  /** Total count of questions in current category */
  rootTotal: number;
  /** Whether more root questions exist (always false now, all loaded at once) */
  hasMoreRoots: boolean;
  /** Whether initial data is loading */
  isLoading: boolean;
  /** Load more root questions (no-op now) */
  loadMoreRoots: () => Promise<void>;
  /** Load children for a specific root question (no-op, already loaded) */
  loadChildren: (rootId: string) => Promise<void>;
  progress: Record<string, 'unread' | 'mastered' | 'reviewing'>;
  favorites: Set<string>;
  isDarkMode: boolean;
  stats: ProgressStats;
  updateProgress: (questionId: string, status: 'unread' | 'mastered' | 'reviewing') => void;
  toggleFavorite: (questionId: string) => void;
  toggleDarkMode: () => void;
  searchQuestions: (query: string) => QuestionTree[];
  getRandomQuestions: (count: number) => QuestionTree[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children, activeCategory }: { children: ReactNode; activeCategory: Category }) {
  const [rootQuestions, setRootQuestions] = useState<QuestionTree[]>([]);
  const [rootTotal, setRootTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [progress, setProgress] = useState<Record<string, 'unread' | 'mastered' | 'reviewing'>>(() => {
    try { return JSON.parse(localStorage.getItem('java-interview-progress') || '{}'); } catch { return {}; }
  });
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('java-interview-favorites') || '[]')); } catch { return new Set(); }
  });
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('java-interview-dark-mode') === 'true');

  // Load category data from local JSON when category changes
  useEffect(() => {
    let cancelled = false;
    
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await loadCategoryData(activeCategory);
        if (cancelled) return;
        setRootQuestions(data.roots);
        setRootTotal(data.total);
      } catch (err) {
        console.error('Failed to load category data:', err);
        if (!cancelled) {
          setRootQuestions([]);
          setRootTotal(0);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    
    load();
    
    return () => { cancelled = true; };
  }, [activeCategory]);

  // Preload adjacent categories on mount
  useEffect(() => {
    const categories: Category[] = ['java-basics', 'concurrency', 'jvm', 'spring', 'mysql', 'redis', 'algorithm', 'distributed'];
    const idx = categories.indexOf(activeCategory);
    if (idx > 0) preloadCategory(categories[idx - 1]);
    if (idx < categories.length - 1) preloadCategory(categories[idx + 1]);
  }, [activeCategory]);

  // Background sync progress from API (non-blocking)
  useEffect(() => {
    const deviceId = getDeviceId();
    fetchProgress(deviceId).then(apiProgress => {
      setProgress(prev => {
        const merged = { ...prev, ...apiProgress };
        localStorage.setItem('java-interview-progress', JSON.stringify(merged));
        return merged;
      });
    }).catch(() => {});
  }, []);

  // Persist progress
  useEffect(() => {
    localStorage.setItem('java-interview-progress', JSON.stringify(progress));
  }, [progress]);
  useEffect(() => {
    localStorage.setItem('java-interview-favorites', JSON.stringify([...favorites]));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem('java-interview-dark-mode', String(isDarkMode));
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // No-op: all data is pre-loaded in tree structure
  const loadMoreRoots = useCallback(async () => {}, []);
  const loadChildren = useCallback(async () => {}, []);

  // Stats
  const stats: ProgressStats = useMemo(() => ({
    total: rootTotal,
    mastered: Object.values(progress).filter(s => s === 'mastered').length,
    reviewing: Object.values(progress).filter(s => s === 'reviewing').length,
    unread: rootTotal - Object.keys(progress).length,
  }), [rootTotal, progress]);

  const updateProgress = useCallback(async (questionId: string, status: 'unread' | 'mastered' | 'reviewing') => {
    setProgress(prev => ({ ...prev, [questionId]: status }));
    try { await apiUpdateProgress(questionId, status); } catch { /* silent */ }
  }, []);

  const toggleFavorite = useCallback((questionId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId); else next.add(questionId);
      return next;
    });
  }, []);

  const toggleDarkMode = useCallback(() => setIsDarkMode(p => !p), []);

  const searchQuestions = useCallback((query: string): QuestionTree[] => {
    if (!query) return rootQuestions;
    const lq = query.toLowerCase();
    return rootQuestions.filter(q => q.title.toLowerCase().includes(lq));
  }, [rootQuestions]);

  const getRandomQuestions = useCallback((count: number): QuestionTree[] => {
    const shuffled = [...rootQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, [rootQuestions]);

  return (
    <AppContext.Provider value={{
      rootQuestions, rootTotal, hasMoreRoots: false, isLoading,
      loadMoreRoots, loadChildren,
      progress, favorites, isDarkMode, stats,
      updateProgress, toggleFavorite, toggleDarkMode,
      searchQuestions, getRandomQuestions,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
