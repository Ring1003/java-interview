import { CATEGORIES } from '../types';
import type { Category } from '../types';
import { useState } from 'react';

interface CategoryTabsProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  stats?: Record<Category, { total: number; mastered: number }>;
}

export function CategoryTabs({ activeCategory, onCategoryChange, stats }: CategoryTabsProps) {
  return (
    <div className="flex flex-col gap-2">
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category.id;
        const categoryStats = stats?.[category.id];
        const progressPercent = categoryStats ? (categoryStats.mastered / (categoryStats.total || 1)) * 100 : 0;
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
              isActive 
                ? 'bg-white shadow-md border border-blue-100' 
                : 'hover:bg-white/50'
            }`}
          >
            <span className={`text-2xl transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
              {category.icon}
            </span>
            <div className="flex-1 text-left">
              <span className={`font-medium ${isActive ? 'text-gray-800' : 'text-gray-600'}`}>
                {category.name}
              </span>
              {isActive && (
                <p className="text-xs text-gray-400 mt-0.5">{category.description}</p>
              )}
            </div>
            
            {/* Mini progress indicator */}
            {categoryStats && (
              <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
            
            {/* Active indicator */}
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// Mobile bottom tabs
export function CategoryBottomTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200/50 px-2 py-2 safe-area-bottom">
      <div className="flex justify-around">
        {CATEGORIES.slice(0, 5).map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
                isActive ? 'bg-blue-50' : ''
              }`}
            >
              <span className="text-xl">{category.icon}</span>
              <span className={`text-xs mt-1 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}