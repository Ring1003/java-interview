import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Question, QuestionTree, Progress, ProgressStats, Category } from '../types';
import { buildQuestionTree } from '../utils/tree';
import { getDeviceId } from '../utils/device';

// 题库数据
import javaBasicsData from '../data/java-basics.json';
import concurrencyData from '../data/concurrency.json';
import jvmData from '../data/jvm.json';
import jvmCompleteData from '../data/jvm_complete.json';
import springData from '../data/spring.json';
import mysqlData from '../data/mysql.json';
import redisData from '../data/redis.json';
import redisBatch1Data from '../data/redis_questions_batch1.json';
import algorithmData from '../data/algorithm.json';
import distributedData from '../data/distributed.json';

interface AppContextType {
  questions: Question[];
  questionTrees: QuestionTree[];
  progress: Record<string, 'unread' | 'mastered' | 'reviewing'>;
  favorites: Set<string>;
  isDarkMode: boolean;
  stats: ProgressStats;
  categoryStats: Record<Category, ProgressStats>;
  updateProgress: (questionId: string, status: 'unread' | 'mastered' | 'reviewing') => void;
  toggleFavorite: (questionId: string) => void;
  toggleDarkMode: () => void;
  searchQuestions: (query: string, category?: Category) => QuestionTree[];
  getRandomQuestions: (count: number, category?: Category) => QuestionTree[];
}

const AppContext = createContext<AppContextType | null>(null);

// 合并所有题库数据并去重
function loadAllQuestions(): Question[] {
  const allData = [
    ...javaBasicsData,
    ...concurrencyData,
    ...jvmData,
    ...jvmCompleteData,
    ...springData,
    ...mysqlData,
    ...redisData,
    ...redisBatch1Data,
    ...algorithmData,
    ...distributedData,
  ] as Question[];

  // 去重
  const uniqueMap = new Map<string, Question>();
  allData.forEach(q => {
    uniqueMap.set(q.id, q);
  });

  return Array.from(uniqueMap.values());
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [questions] = useState<Question[]>(() => loadAllQuestions());
  const [questionTrees] = useState<QuestionTree[]>(() => 
    buildQuestionTree(questions)
  );
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

  // 保存到 localStorage
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

  // 计算总体统计
  const stats: ProgressStats = {
    total: questions.length,
    mastered: Object.values(progress).filter(s => s === 'mastered').length,
    reviewing: Object.values(progress).filter(s => s === 'reviewing').length,
    unread: questions.length - Object.keys(progress).length,
  };

  // 计算分类统计
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

  const updateProgress = (questionId: string, status: 'unread' | 'mastered' | 'reviewing') => {
    setProgress(prev => ({
      ...prev,
      [questionId]: status,
    }));
  };

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
      
      // 递归搜索函数
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
          
          // 搜索子节点
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
    
    // 只选择顶层问题（level === 0）
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
