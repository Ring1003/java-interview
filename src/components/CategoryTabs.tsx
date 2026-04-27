import type { Category, CategoryInfo, ProgressStats } from '../types';
import { CATEGORIES } from '../types';

interface CategoryTabsProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  stats?: Record<Category, ProgressStats>;
}

export function CategoryTabs({ activeCategory, onCategoryChange, stats }: CategoryTabsProps) {
  return (
    <nav className="space-y-1">
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category.id;
        const categoryStats = stats?.[category.id];
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </div>
              {categoryStats && (
                <span className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'}`}>
                  {categoryStats.mastered}/{categoryStats.total}
                </span>
              )}
            </div>
            {!isActive && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
                {category.description}
              </p>
            )}
          </button>
        );
      })}
    </nav>
  );
}

interface CategoryBottomTabsProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  stats?: Record<Category, ProgressStats>;
}

export function CategoryBottomTabs({ activeCategory, onCategoryChange, stats }: CategoryBottomTabsProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 px-2 py-2 z-20">
      <div className="flex justify-around max-w-lg mx-auto">
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category.id;
          const categoryStats = stats?.[category.id];
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex flex-col items-center px-2 py-1 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-500 dark:text-blue-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <span className="text-xl">{category.icon}</span>
              <span className="text-xs mt-0.5 font-medium">{category.name}</span>
              {categoryStats && categoryStats.mastered > 0 && (
                <span className="text-xs text-green-500 dark:text-green-400">
                  {categoryStats.mastered}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
