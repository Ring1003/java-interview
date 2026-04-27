import type { ProgressStats } from '../types';

interface ProgressBarProps {
  stats: ProgressStats;
}

export function ProgressBar({ stats }: ProgressBarProps) {
  const percentage = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
  
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">学习进度</h3>
        <span className="text-sm font-bold text-gray-800 dark:text-white">{percentage}%</span>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Stats breakdown */}
      <div className="flex justify-between mt-3 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-400 rounded-full"></span>
          <span className="text-gray-500 dark:text-gray-400">已掌握 {stats.mastered}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
          <span className="text-gray-500 dark:text-gray-400">待复习 {stats.reviewing}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-gray-300 dark:bg-gray-500 rounded-full"></span>
          <span className="text-gray-500 dark:text-gray-400">未学习 {stats.unread}</span>
        </div>
      </div>
      
      {/* Total */}
      <div className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
        共 {stats.total} 题
      </div>
    </div>
  );
}