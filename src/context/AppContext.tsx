import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { Question, QuestionTree, ProgressStats, Category } from '../types';
import { buildQuestionTree } from '../utils/tree';
import { getDeviceId } from '../utils/device';
import { fetchQuestions, fetchAllQuestionTrees } from '../services/questionApi';
import { fetchProgress, updateProgress as apiUpdateProgress } from '../services/progressApi';

const ALL_CATEGORIES: Category[] = ['java-basics', 'concurrency', 'jvm', 'spring', 'mysql', 'redis', 'algorithm', 'distributed', 'ai'];

interface AppContextType {
  questions: Question[];
  questionTrees: QuestionTree[];
  progress: Record<string, 'unread' | 'mastered' | 'reviewing'>;
  favorites: Set<string>;
  isDarkMode: boolean;
  isLoading: boolean;
  stats: ProgressStats;
  categoryStats: Record<Category, ProgressStats>;
  updateProgress: (questionId: string, status: 'unread' | 'mastered' | 'reviewing') => void;
  toggleFavorite: (questionId: string) => void;
  toggleDarkMode: () => void;
  searchQuestions: (query: string, category?: Category) => QuestionTree[];
  getRandomQuestions: (count: number, category?: Category) => QuestionTree[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionTrees, setQuestionTrees] = useState<QuestionTree[]>([]);
  const [progress, setProgress] = useState<Record<string, 'unread' | 'mastered' | 'reviewing'>>(() => {
    const saved = localStorage.getItem('java-interview-progress');
    return saved ? JSON.parse(saved) : {};
  });
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('java-interview-favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('java-interview-dark-mode');
    return saved === 'true';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCategories, setLoadedCategories] = useState<Set<string>>(new Set());

  // Load questions per category (lazy loading)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all categories in parallel
        const results = await Promise.all(
          ALL_CATEGORIES.map(cat => fetchQuestions(cat).catch(() => [] as Question[]))
        );
        const allQuestions = results.flat();
        
        // Deduplicate by id
        const uniqueMap = new Map<string, Question>();
        allQuestions.forEach(q => uniqueMap.set(q.id, q));
        const uniqueQuestions = Array.from(uniqueMap.values());
        
        setQuestions(uniqueQuestions);
        setQuestionTrees(buildQuestionTree(uniqueQuestions));
        setLoadedCategories(new Set(ALL_CATEGORIES));
        
        // Sync progress from API
        const deviceId = getDeviceId();
        try {
          const apiProgress = await fetchProgress(deviceId);
          const mergedProgress = { ...progress, ...apiProgress };
          setProgress(mergedProgress);
          localStorage.setItem('java-interview-progress', JSON.stringify(mergedProgress));
        } catch {
          // Use local progress
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('java-interview-progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('java-interview-favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('java-interview-dark-mode', isDarkMode.toString());
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Overall stats
  const stats: ProgressStats = useMemo(() => ({
    total: questions.length,
    mastered: Object.values(progress).filter(s => s === 'mastered').length,
    reviewing: Object.values(progress).filter(s => s === 'reviewing').length,
    unread: questions.length - Object.keys(progress).filter(id => questions.some(q => q.id === id)).length,
  }), [questions, progress]);

  // Per-category stats
  const categoryStats: Record<Category, ProgressStats> = useMemo(() => {
    const result = {} as Record<Category, ProgressStats>;
    ALL_CATEGORIES.forEach(cat => {
      const catQuestions = questions.filter(q => q.category === cat);
      const catIds = new Set(catQuestions.map(q => q.id));
      result[cat] = {
        total: catQuestions.length,
        mastered: Object.entries(progress).filter(([id, s]) => catIds.has(id) && s === 'mastered').length,
        reviewing: Object.entries(progress).filter(([id, s]) => catIds.has(id) && s === 'reviewing').length,
        unread: catQuestions.length - Object.keys(progress).filter(id => catIds.has(id)).length,
      };
    });
    return result;
  }, [questions, progress]);

  const updateProgress = useCallback(async (questionId: string, status: 'unread' | 'mastered' | 'reviewing') => {
    setProgress(prev => ({ ...prev, [questionId]: status }));
    try { await apiUpdateProgress(questionId, status); } catch { /* silent */ }
  }, []);

  const toggleFavorite = useCallback((questionId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }, []);

  const toggleDarkMode = useCallback(() => setIsDarkMode(p => !p), []);

  const searchQuestions = useCallback((query: string, category?: Category): QuestionTree[] => {
    let filtered = questionTrees;
    if (category) filtered = filtered.filter(q => q.category === category);
    if (query) {
      const lq = query.toLowerCase();
      const match = (trees: QuestionTree[]): QuestionTree[] =>
        trees.filter(t => {
          if (t.title.toLowerCase().includes(lq) || t.answer.toLowerCase().includes(lq) || (t.tags && t.tags.toLowerCase().includes(lq))) return true;
          if (t.children?.length) {
            const mc = match(t.children);
            if (mc.length) { t.children = mc; return true; }
          }
          return false;
        });
      return match(filtered);
    }
    return filtered;
  }, [questionTrees]);

  const getRandomQuestions = useCallback((count: number, category?: Category): QuestionTree[] => {
    let pool = category ? questionTrees.filter(q => q.category === category) : questionTrees;
    pool = pool.filter(q => q.level === 0);
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }, [questionTrees]);

  return (
    <AppContext.Provider value={{
      questions, questionTrees, progress, favorites, isDarkMode, isLoading,
      stats, categoryStats, updateProgress, toggleFavorite, toggleDarkMode,
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
