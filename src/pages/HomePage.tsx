import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { CategoryTabs, CategoryBottomTabs } from '../components/CategoryTabs';
import { QuestionCard } from '../components/QuestionCard';
import { SearchBar } from '../components/SearchBar';
import { ProgressBar } from '../components/ProgressBar';
import { DarkModeToggle } from '../components/DarkModeToggle';
import { FavoritesButton } from '../components/FavoritesButton';
import { QuizButton } from '../components/QuizButton';
import { useApp } from '../context/AppContext';
import type { Category, QuestionTree } from '../types';

const PAGE_SIZE = 20; // 每页渲染20道题

export function HomePage() {
  const { 
    questionTrees, 
    progress, 
    favorites, 
    isDarkMode,
    stats, 
    categoryStats, 
    updateProgress, 
    toggleFavorite,
    toggleDarkMode,
    searchQuestions 
  } = useApp();
  
  const [activeCategory, setActiveCategory] = useState<Category>('java-basics');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
      const handler = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handler);
      return () => window.removeEventListener('resize', handler);
    }
  }, []);

  // Reset page when category or search changes
  useEffect(() => { setPage(1); }, [activeCategory, searchQuery, showFavoritesOnly]);

  // Filter questions for current category
  const categoryQuestions = useMemo(() => {
    let result = questionTrees.filter(q => q.category === activeCategory);
    if (searchQuery) {
      const lq = searchQuery.toLowerCase();
      result = result.filter(q => 
        q.title.toLowerCase().includes(lq) || 
        q.answer.toLowerCase().includes(lq) ||
        (q.tags && q.tags.toLowerCase().includes(lq))
      );
    }
    if (showFavoritesOnly) {
      result = result.filter(q => {
        if (favorites.has(q.id)) return true;
        if (q.children) {
          const hasFavChild = (children: QuestionTree[]): boolean => 
            children.some(c => favorites.has(c.id) || (c.children && hasFavChild(c.children)));
          return hasFavChild(q.children);
        }
        return false;
      });
    }
    return result;
  }, [questionTrees, activeCategory, searchQuery, showFavoritesOnly, favorites]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(categoryQuestions.length / PAGE_SIZE));
  const paginatedQuestions = categoryQuestions.slice(0, page * PAGE_SIZE);
  const hasMore = page < totalPages;

  // Infinite scroll sentinel
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleLoadMore = useCallback(() => {
    if (hasMore) setPage(p => p + 1);
  }, [hasMore]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) handleLoadMore(); },
      { rootMargin: '200px' }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  const handleStatusChange = (questionId: string, status: 'unread' | 'mastered' | 'reviewing') => {
    updateProgress(questionId, status);
  };

  const handleFavoriteClick = (questionId: string) => {
    toggleFavorite(questionId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Desktop */}
      <div className="hidden md:flex flex-1">
        <aside className="w-72 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50 p-4 sticky top-0 h-screen overflow-y-auto transition-colors duration-300">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">☕ Java 八股文</h1>
              <DarkModeToggle isDark={isDarkMode} onToggle={toggleDarkMode} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">面试题学习系统 · {categoryQuestions.length} 题</p>
          </div>
          <div className="mb-6 space-y-3">
            <SearchBar onSearch={setSearchQuery} />
            <div className="flex gap-2">
              <FavoritesButton isActive={showFavoritesOnly} onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} count={favorites.size} />
              <QuizButton category={activeCategory} />
            </div>
          </div>
          <div className="mb-6">
            <ProgressBar stats={stats} />
          </div>
          <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} stats={categoryStats} />
        </aside>
        <main className="flex-1 p-8 max-w-4xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {showFavoritesOnly ? '⭐ 收藏' : `${activeCategory.replace('-', ' ')} 题目`}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              共 {categoryQuestions.length} 道 · 已加载 {paginatedQuestions.length} 道
            </p>
          </div>
          <div className="space-y-4">
            {paginatedQuestions.map(question => (
              <QuestionCard
                key={question.id}
                question={question}
                currentStatus={progress[question.id] || 'unread'}
                isFavorite={favorites.has(question.id)}
                onStatusChange={handleStatusChange}
                onFavoriteClick={handleFavoriteClick}
                progress={progress}
                favorites={favorites}
              />
            ))}
            <div ref={loadMoreRef} className="h-4" />
            {hasMore && paginatedQuestions.length < categoryQuestions.length && (
              <div className="text-center py-4">
                <button onClick={handleLoadMore} className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
                  加载更多 ({categoryQuestions.length - paginatedQuestions.length} 剩余)
                </button>
              </div>
            )}
            {categoryQuestions.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {searchQuery ? '没有找到匹配的题目' : showFavoritesOnly ? '还没有收藏' : '暂无题目'}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex-1 pb-20">
        <header className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 p-4 z-10 transition-colors duration-300">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">☕ Java 八股文</h1>
            <div className="flex items-center gap-2">
              <FavoritesButton isActive={showFavoritesOnly} onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} count={favorites.size} />
              <DarkModeToggle isDark={isDarkMode} onToggle={toggleDarkMode} />
            </div>
          </div>
          <div className="flex gap-2">
            <SearchBar onSearch={setSearchQuery} />
            <QuizButton category={activeCategory} />
          </div>
        </header>
        <main className="p-4">
          <div className="mb-4">
            <ProgressBar stats={stats} />
          </div>
          <div className="space-y-3">
            {paginatedQuestions.map(question => (
              <QuestionCard
                key={question.id}
                question={question}
                currentStatus={progress[question.id] || 'unread'}
                isFavorite={favorites.has(question.id)}
                onStatusChange={handleStatusChange}
                onFavoriteClick={handleFavoriteClick}
                progress={progress}
                favorites={favorites}
              />
            ))}
            <div ref={loadMoreRef} className="h-4" />
            {hasMore && (
              <div className="text-center py-4">
                <button onClick={handleLoadMore} className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600">
                  加载更多
                </button>
              </div>
            )}
            {categoryQuestions.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">暂无题目</div>
            )}
          </div>
        </main>
        <CategoryBottomTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} stats={categoryStats} />
      </div>
    </div>
  );
}
