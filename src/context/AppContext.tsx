import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from 'react';
import type { Question, QuestionTree, ProgressStats, Category } from '../types';
import { fetchRootQuestions, fetchChildQuestions } from '../services/questionApi';
import { getDeviceId } from '../utils/device';
import { fetchProgress, updateProgress as apiUpdateProgress } from '../services/progressApi';

interface AppContextType {
  /** Root-level question trees for current category (with children loaded on demand) */
  rootQuestions: QuestionTree[];
  /** Total count of root questions in current category */
  rootTotal: number;
  /** Whether more root questions exist */
  hasMoreRoots: boolean;
  /** Whether initial data is loading */
  isLoading: boolean;
  /** Load more root questions */
  loadMoreRoots: () => Promise<void>;
  /** Load children for a specific root question */
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
  const [hasMoreRoots, setHasMoreRoots] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedChildren, setLoadedChildren] = useState<Set<string>>(new Set());
  
  const [progress, setProgress] = useState<Record<string, 'unread' | 'mastered' | 'reviewing'>>(() => {
    try { return JSON.parse(localStorage.getItem('java-interview-progress') || '{}'); } catch { return {}; }
  });
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('java-interview-favorites') || '[]')); } catch { return new Set(); }
  });
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('java-interview-dark-mode') === 'true');

  // Load root questions when category changes
  useEffect(() => {
    let cancelled = false;
    
    const load = async () => {
      setIsLoading(true);
      setLoadedChildren(new Set());
      try {
        const { results, total, hasMore } = await fetchRootQuestions(activeCategory, 50, 0);
        if (cancelled) return;
        setRootQuestions(results.map(q => ({ ...q, children: [] as QuestionTree[] })));
        setRootTotal(total);
        setHasMoreRoots(hasMore);
      } catch (err) {
        console.error('Failed to load questions:', err);
        if (!cancelled) {
          setRootQuestions([]);
          setRootTotal(0);
          setHasMoreRoots(false);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    
    load();
    
    // Sync progress from API on first load
    const deviceId = getDeviceId();
    fetchProgress(deviceId).then(apiProgress => {
      if (cancelled) return;
      setProgress(prev => {
        const merged = { ...prev, ...apiProgress };
        localStorage.setItem('java-interview-progress', JSON.stringify(merged));
        return merged;
      });
    }).catch(() => {});
    
    return () => { cancelled = true; };
  }, [activeCategory]);

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

  // Load more root questions
  const loadMoreRoots = useCallback(async () => {
    if (!hasMoreRoots) return;
    const { results, hasMore } = await fetchRootQuestions(activeCategory, 50, rootQuestions.length);
    setRootQuestions(prev => [
      ...prev,
      ...results.map(q => ({ ...q, children: [] as QuestionTree[] })),
    ]);
    setHasMoreRoots(hasMore);
  }, [hasMoreRoots, activeCategory, rootQuestions.length]);

  // Load children for a specific root question (recursively, all levels)
  const loadChildren = useCallback(async (rootId: string) => {
    if (loadedChildren.has(rootId)) return;
    
    setLoadedChildren(prev => new Set(prev).add(rootId));
    
    try {
      // Fetch all descendants recursively
      const allQuestions: Question[] = [];
      const queue = [rootId];
      
      while (queue.length > 0) {
        const parentId = queue.shift()!;
        const children = await fetchChildQuestions(parentId);
        allQuestions.push(...children);
        children.forEach(c => queue.push(c.id));
      }
      
      // Build tree
      const questionMap = new Map<string, QuestionTree>();
      allQuestions.forEach(q => questionMap.set(q.id, { ...q, children: [] }));
      
      // Attach children to parents
      allQuestions.forEach(q => {
        if (q.parent_id && questionMap.has(q.parent_id)) {
          questionMap.get(q.parent_id)!.children.push(questionMap.get(q.id)!);
        }
      });
      
      // Sort children
      questionMap.forEach(node => {
        node.children.sort((a, b) => a.sort_order - b.sort_order);
      });
      
      // Find direct children of root
      const directChildren = allQuestions
        .filter(q => q.parent_id === rootId)
        .map(q => questionMap.get(q.id)!)
        .sort((a, b) => a.sort_order - b.sort_order);
      
      // Update the root question's children
      setRootQuestions(prev => prev.map(rq => 
        rq.id === rootId ? { ...rq, children: directChildren } : rq
      ));
    } catch (err) {
      console.error('Failed to load children for', rootId, err);
      setLoadedChildren(prev => {
        const next = new Set(prev);
        next.delete(rootId);
        return next;
      });
    }
  }, [loadedChildren]);

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
      rootQuestions, rootTotal, hasMoreRoots, isLoading,
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
