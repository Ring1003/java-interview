import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from 'react';
import type { QuestionTree, ProgressStats, Category } from '../types';
import { loadCategoryData, preloadCategory } from '../services/questionData';
import { getDeviceId } from '../utils/device';
import { fetchProgress, updateProgress as apiUpdateProgress } from '../services/progressApi';

interface AppContextType {
  rootQuestions: QuestionTree[];
  rootTotal: number;
  hasMoreRoots: boolean;
  isLoading: boolean;
  loadMoreRoots: () => Promise<void>;
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

/** Debounce a function */
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  const wrapped = ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
  return wrapped;
}

const ALL_CATEGORIES: Category[] = ['java-basics', 'concurrency', 'jvm', 'spring', 'mysql', 'redis', 'algorithm', 'distributed'];

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

  // Load category data when category changes
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

  // Preload other categories during idle time
  useEffect(() => {
    if (typeof window === 'undefined' || !('requestIdleCallback' in window)) return;
    
    const categoriesToPreload = ALL_CATEGORIES.filter(c => c !== activeCategory);
    let index = 0;
    
    const preloadNext = () => {
      if (index >= categoriesToPreload.length) return;
      const cat = categoriesToPreload[index++];
      preloadCategory(cat);
      (window as any).requestIdleCallback(preloadNext, { timeout: 5000 });
    };
    
    (window as any).requestIdleCallback(preloadNext, { timeout: 2000 });
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

  // Debounced localStorage persistence for progress
  const debouncedSaveProgress = useRef(
    debounce((p: Record<string, 'unread' | 'mastered' | 'reviewing'>) => {
      localStorage.setItem('java-interview-progress', JSON.stringify(p));
    }, 500)
  ).current;

  useEffect(() => {
    debouncedSaveProgress(progress);
  }, [progress, debouncedSaveProgress]);

  // Persist favorites (debounced)
  const debouncedSaveFavorites = useRef(
    debounce((f: Set<string>) => {
      localStorage.setItem('java-interview-favorites', JSON.stringify([...f]));
    }, 500)
  ).current;

  useEffect(() => {
    debouncedSaveFavorites(favorites);
  }, [favorites, debouncedSaveFavorites]);

  useEffect(() => {
    localStorage.setItem('java-interview-dark-mode', String(isDarkMode));
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const loadMoreRoots = useCallback(async () => {}, []);
  const loadChildren = useCallback(async () => {}, []);

  const stats: ProgressStats = useMemo(() => ({
    total: rootTotal,
    mastered: Object.values(progress).filter(s => s === 'mastered').length,
    reviewing: Object.values(progress).filter(s => s === 'reviewing').length,
    unread: rootTotal - Object.keys(progress).length,
  }), [rootTotal, progress]);

  // Debounced API sync for progress updates
  const debouncedApiSync = useRef(
    debounce(async (questionId: string, status: 'unread' | 'mastered' | 'reviewing') => {
      try { await apiUpdateProgress(questionId, status); } catch { /* silent */ }
    }, 1000)
  ).current;

  const updateProgress = useCallback((questionId: string, status: 'unread' | 'mastered' | 'reviewing') => {
    setProgress(prev => ({ ...prev, [questionId]: status }));
    debouncedApiSync(questionId, status);
  }, [debouncedApiSync]);

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
