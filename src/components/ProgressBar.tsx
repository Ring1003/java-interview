import type { ProgressStats } from '../types';

interface ProgressBarProps {
  stats: ProgressStats;
}

export function ProgressBar({ stats }: ProgressBarProps) {
  const total = stats.total || 1;
  const masteredPercent = (stats.mastered / total) * 100;
  const reviewingPercent = (stats.reviewing / total) * 100;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-200/50">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-600">学习进度</span>
        <span className="text-sm text-gray-500">{stats.mastered}/{stats.total} 已掌握</span>
      </div>
      
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
        {masteredPercent > 0 && (
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-300"
            style={{ width: `${masteredPercent}%` }}
          />
        )}
        {reviewingPercent > 0 && (
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-300"
            style={{ width: `${reviewingPercent}%` }}
          />
        )}
      </div>
      
      <div className="flex gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-gray-500">已掌握 {stats.mastered}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          <span className="text-gray-500">需复习 {stats.reviewing}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-200"></div>
          <span className="text-gray-500">未学习 {stats.unread}</span>
        </div>
      </div>
    </div>
  );
}
