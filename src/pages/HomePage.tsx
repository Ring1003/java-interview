import { useState, useMemo } from 'react';
import { CategoryTabs, CategoryBottomTabs } from '../components/CategoryTabs';
import { QuestionCard } from '../components/QuestionCard';
import { SearchBar } from '../components/SearchBar';
import { ProgressBar } from '../components/ProgressBar';
import { DarkModeToggle } from '../components/DarkModeToggle';
import { FavoritesButton } from '../components/FavoritesButton';
import { QuizButton } from '../components/QuizButton';
import { useApp } from '../context/AppContext';
import type { Category, QuestionTree } from '../types';

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

  // 检测移动端
  useMemo(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);

  // 过滤问题
  const filteredQuestions = useMemo(() => {
    let result = searchQuestions(searchQuery, activeCategory);
    
    if (showFavoritesOnly) {
      // 只显示收藏的问题
      const filterFavorites = (trees: QuestionTree[]): QuestionTree[] => {
        return trees.filter(tree => {
          const isFav = favorites.has(tree.id);
          const hasFavChildren = tree.children && filterFavorites(tree.children).length > 0;
          return isFav || hasFavChildren;
        }).map(tree => ({
          ...tree,
          children: tree.children ? filterFavorites(tree.children) : []
        }));
      };
      result = filterFavorites(result);
    }
    
    return result;
  }, [searchQuery, activeCategory, showFavoritesOnly, favorites, searchQuestions]);

  const handleStatusChange = (questionId: string, status: 'unread' | 'mastered' | 'reviewing') => {
    updateProgress(questionId, status);
  };

  const handleFavoriteClick = (questionId: string) => {
    toggleFavorite(questionId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1">
        {/* Sidebar */}
        <aside className="w-72 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50 p-4 sticky top-0 h-screen overflow-y-auto transition-colors duration-300">
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
              <FavoritesButton 
                isActive={showFavoritesOnly} 
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                count={favorites.size}
              />
              <QuizButton category={activeCategory} />
            </div>
          </div>
          
          <div className="mb-6">
            <ProgressBar stats={showFavoritesOnly ? { 
              total: favorites.size, 
              mastered: Array.from(favorites).filter(id => progress[id] === 'mastered').length,
              reviewing: Array.from(favorites).filter(id => progress[id] === 'reviewing').length,
              unread: Array.from(favorites).filter(id => !progress[id] || progress[id] === 'unread').length
            } : stats} />
          </div>
          
          <CategoryTabs 
            activeCategory={activeCategory} 
            onCategoryChange={setActiveCategory}
            stats={categoryStats}
          />
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-8 max-w-4xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {showFavoritesOnly ? '⭐ 收藏的题目' : `${activeCategory.replace('-', ' ')} 题目`}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">共 {filteredQuestions.length} 道题</p>
          </div>
          
          <div className="space-y-4">
            {filteredQuestions.map(question => (
              <QuestionCard
                key={question.id}
                question={question}
                currentStatus={progress[question.id] || 'unread'}
                isFavorite={favorites.has(question.id)}
                onStatusChange={handleStatusChange}
                onFavoriteClick={handleFavoriteClick}
              />
            ))}
            
            {filteredQuestions.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {searchQuery ? '没有找到匹配的题目' : showFavoritesOnly ? '还没有收藏任何题目' : '暂无题目'}
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Mobile Layout */}
      <div className="md:hidden flex-1 pb-20">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 p-4 z-10 transition-colors duration-300">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">☕ Java 八股文</h1>
            <div className="flex items-center gap-2">
              <FavoritesButton 
                isActive={showFavoritesOnly} 
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                count={favorites.size}
              />
              <DarkModeToggle isDark={isDarkMode} onToggle={toggleDarkMode} />
            </div>
          </div>
          <div className="flex gap-2">
            <SearchBar onSearch={setSearchQuery} />
            <QuizButton category={activeCategory} />
          </div>
        </header>
        
        {/* Content */}
        <main className="p-4">
          <div className="mb-4">
            <ProgressBar stats={stats} />
          </div>
          
          <div className="space-y-3">
            {filteredQuestions.map(question => (
              <QuestionCard
                key={question.id}
                question={question}
                currentStatus={progress[question.id] || 'unread'}
                isFavorite={favorites.has(question.id)}
                onStatusChange={handleStatusChange}
                onFavoriteClick={handleFavoriteClick}
              />
            ))}
            
            {filteredQuestions.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {searchQuery ? '没有找到匹配的题目' : showFavoritesOnly ? '还没有收藏任何题目' : '暂无题目'}
              </div>
            )}
          </div>
        </main>
        
        {/* Bottom Tabs */}
        <CategoryBottomTabs 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          stats={categoryStats}
        />
      </div>
    </div>
  );
}
