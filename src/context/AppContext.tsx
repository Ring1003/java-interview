import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Question, QuestionTree, Progress, ProgressStats, Category } from '../types';
import { buildQuestionTree } from '../utils/tree';
import { getDeviceId } from '../utils/device';
import { fetchQuestions, fetchAllQuestionTrees } from '../services/questionApi';
import { fetchProgress, updateProgress as apiUpdateProgress, fetchProgressStats } from '../services/progressApi';

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

  // Load questions from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all questions from API
        const categories: Category[] = ['java-basics', 'concurrency', 'jvm', 'spring', 'mysql', 'redis', 'algorithm', 'distributed'];
        const results = await Promise.all(
          categories.map(cat => fetchQuestions(cat).catch(() => []))
        );
        const allQuestions = results.flat();
        
        // Deduplicate
        const uniqueMap = new Map<string, Question>();
        allQuestions.forEach(q => {
          uniqueMap.set(q.id, q);
        });
        const uniqueQuestions = Array.from(uniqueMap.values());
        
        setQuestions(uniqueQuestions);
        setQuestionTrees(buildQuestionTree(uniqueQuestions));
        
        // Also try to fetch progress from API
        const deviceId = getDeviceId();
        try {
          const apiProgress = await fetchProgress(deviceId);
          // Merge with local progress
          const mergedProgress = { ...progress, ...apiProgress };
          setProgress(mergedProgress);
          localStorage.setItem('java-interview-progress', JSON.stringify(mergedProgress));
        } catch {
          // Use local progress if API fails
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
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Calculate overall stats
  const stats: ProgressStats = {
    total: questions.length,
    mastered: Object.values(progress).filter(s => s === 'mastered').length,
    reviewing: Object.values(progress).filter(s => s === 'reviewing').length,
    unread: questions.length - Object.keys(progress).length,
  };

  // Calculate category stats
  const categoryStats: Record<Category, ProgressStats> = {} as Record<Category, ProgressStats>;
  const categories: Category[] = ['java-basics', 'concurrency', 'jvm', 'spring', 'mysql', 'redis', 'algorithm', 'distributed'];
  
  categories.forEach(cat => {
    const catQuestions = questions.filter(q => q.category === cat);
    const catIds = catQuestions.map(q => q.id);
    categoryStats[cat] = {
      total: catQuestions.length,
      mastered: catIds.filter(id => progress[id] === 'mastered').length,
      reviewing: catIds.filter(id => progress[id] === 'reviewing').length,
      unread: catIds.filter(id => !progress[id] || progress[id] === 'unread').length,
    };
  });

  const updateProgress = useCallback(async (questionId: string, status: 'unread' | 'mastered' | 'reviewing') => {
    // Update local state first
    setProgress(prev => ({
      ...prev,
      [questionId]: status,
    }));
    
    // Sync with API (non-blocking)
    try {
      await apiUpdateProgress(questionId, status);
    } catch {
      // Silent fail, local storage will sync later
    }
  }, []);

  const toggleFavorite = (questionId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const searchQuestions = (query: string, category?: Category): QuestionTree[] => {
    let filtered = questionTrees;
    
    if (category) {
      filtered = filtered.filter(q => q.category === category);
    }
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      const matchingIds = new Set<string>();
      
      // Recursive search
      const searchInTree = (trees: QuestionTree[]): QuestionTree[] => {
        return trees.filter(tree => {
          const matches = 
            tree.title.toLowerCase().includes(lowerQuery) ||
            tree.answer.toLowerCase().includes(lowerQuery) ||
            tree.tags?.toLowerCase().includes(lowerQuery);
          
          if (matches) {
            matchingIds.add(tree.id);
            return true;
          }
          
          if (tree.children && tree.children.length > 0) {
            const matchingChildren = searchInTree(tree.children);
            if (matchingChildren.length > 0) {
              matchingIds.add(tree.id);
              return true;
            }
          }
          
          return false;
        });
      };
      
      return searchInTree(filtered);
    }
    
    return filtered;
  };

  const getRandomQuestions = (count: number, category?: Category): QuestionTree[] => {
    let pool = category 
      ? questionTrees.filter(q => q.category === category)
      : questionTrees;
    
    // Only select top-level questions
    pool = pool.filter(q => q.level === 0);
    
    // Fisher-Yates shuffle
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, count);
  };

  return (
    <AppContext.Provider value={{
      questions,
      questionTrees,
      progress,
      favorites,
      isDarkMode,
      isLoading,
      stats,
      categoryStats,
      updateProgress,
      toggleFavorite,
      toggleDarkMode,
      searchQuestions,
      getRandomQuestions,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}