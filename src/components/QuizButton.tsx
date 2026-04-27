import { Link } from 'react-router-dom';
import type { Category } from '../types';

interface QuizButtonProps {
  category?: Category;
}

export function QuizButton({ category }: QuizButtonProps) {
  return (
    <Link
      to={category ? `/quiz/${category}` : '/quiz'}
      className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-sm"
      title="开始刷题"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
      <span className="hidden sm:inline">刷题</span>
    </Link>
  );
}
