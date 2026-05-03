import { useState, useEffect } from 'react';
import { CategoryTabs, CategoryBottomTabs } from '../components/CategoryTabs';
import { QuestionCard } from '../components/QuestionCard';
import { SearchBar } from '../components/SearchBar';
import { ProgressBar } from '../components/ProgressBar';
import { DarkModeToggle } from '../components/DarkModeToggle';
import { FavoritesButton } from '../components/FavoritesButton';
import { QuizButton } from '../components/QuizButton';
import { AppProvider, useApp } from '../context/AppContext';
import type { Category } from '../types';
import { CATEGORIES } from '../types';

function HomeContent({ activeCategory, onCategoryChange }: { activeCategory: Category; onCategoryChange: (c: Category) => void }) {
  const { 
    rootQuestions, rootTotal, isLoading,
    progress, favorites, isDarkMode, stats,
    updateProgress, toggleFavorite, toggleDarkMode,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
      const handler = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handler);
      return () => window.removeEventListener('resize', handler);
    }
  }, []);

  // Filter
  const filteredQuestions = (() => {
    let result = rootQuestions;
    if (searchQuery) {
      const lq = searchQuery.toLowerCase();
      result = result.filter(q => q.title.toLowerCase().includes(lq));
    }
    if (showFavoritesOnly) {
      result = result.filter(q => favorites.has(q.id));
    }
    return result;
  })();

  const categoryInfo = CATEGORIES.find(c => c.id === activeCategory);
  const title = showFavoritesOnly ? '⭐ 收藏' : `${categoryInfo?.icon || ''} ${categoryInfo?.name || ''} 题目`;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Desktop */}
      <div className="hidden md:flex flex-1">
        <aside className="w-72 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50 p-4 sticky top-0 h-screen overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">☕ Java 八股文</h1>
              <DarkModeToggle isDark={isDarkMode} onToggle={toggleDarkMode} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">面试题学习系统</p>
          </div>
          <div className="mb-6 space-y-3">
            <SearchBar onSearch={setSearchQuery} />
            <div className="flex gap-2">
              <FavoritesButton isActive={showFavoritesOnly} onClick={() => setShowFavoritesOnly(v => !v)} count={favorites.size} />
              <QuizButton category={activeCategory} />
            </div>
          </div>
          <div className="mb-6">
            <ProgressBar stats={stats} />
          </div>
          <CategoryTabs activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
        </aside>
        <main className="flex-1 p-8 max-w-4xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              共 {rootTotal} 道题{filteredQuestions.length !== rootQuestions.length ? ` · 显示 ${filteredQuestions.length} 道` : ''}
            </p>
          </div>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <QuestionList
              questions={filteredQuestions}
              progress={progress}
              favorites={favorites}
              onStatusChange={updateProgress}
              onFavoriteClick={toggleFavorite}
              emptyMessage={searchQuery ? '没有找到匹配的题目' : showFavoritesOnly ? '还没有收藏' : '暂无题目'}
            />
          )}
        </main>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex-1 pb-20">
        <header className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 p-4 z-10">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">☕ Java 八股文</h1>
            <div className="flex items-center gap-2">
              <FavoritesButton isActive={showFavoritesOnly} onClick={() => setShowFavoritesOnly(v => !v)} count={favorites.size} />
              <DarkModeToggle isDark={isDarkMode} onToggle={toggleDarkMode} />
            </div>
          </div>
          <div className="flex gap-2">
            <SearchBar onSearch={setSearchQuery} />
            <QuizButton category={activeCategory} />
          </div>
        </header>
        <main className="p-4">
          <div className="mb-4"><ProgressBar stats={stats} /></div>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <QuestionList
              questions={filteredQuestions}
              progress={progress}
              favorites={favorites}
              onStatusChange={updateProgress}
              onFavoriteClick={toggleFavorite}
              emptyMessage="暂无题目"
            />
          )}
        </main>
        <CategoryBottomTabs activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-500 dark:text-gray-400">加载中...</span>
      </div>
    </div>
  );
}

function QuestionList({
  questions, progress, favorites, onStatusChange, onFavoriteClick, emptyMessage,
}: {
  questions: any[];
  progress: Record<string, any>;
  favorites: Set<string>;
  onStatusChange: (id: string, status: any) => void;
  onFavoriteClick: (id: string) => void;
  emptyMessage: string;
}) {
  return (
    <div className="space-y-4">
      {questions.map((q: any) => (
        <QuestionCard
          key={q.id}
          question={q}
          currentStatus={progress[q.id] || 'unread'}
          isFavorite={favorites.has(q.id)}
          onStatusChange={onStatusChange}
          onFavoriteClick={onFavoriteClick}
          progress={progress}
          favorites={favorites}
        />
      ))}
      {questions.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">{emptyMessage}</div>
      )}
    </div>
  );
}

export function HomePage() {
  const [activeCategory, setActiveCategory] = useState<Category>('java-basics');
  return (
    <AppProvider activeCategory={activeCategory}>
      <HomeContent activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
    </AppProvider>
  );
}
