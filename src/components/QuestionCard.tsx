import { useState } from 'react';
import type { QuestionTree } from '../types';

interface QuestionCardProps {
  question: QuestionTree;
  onStatusChange: (questionId: string, status: 'unread' | 'mastered' | 'reviewing') => void;
  onFavoriteClick?: (questionId: string) => void;
  currentStatus: 'unread' | 'mastered' | 'reviewing';
  isFavorite?: boolean;
  expandedChildren?: QuestionTree[];
  onExpandChild?: (child: QuestionTree) => void;
}

export function QuestionCard({ 
  question, 
  onStatusChange, 
  onFavoriteClick,
  currentStatus,
  isFavorite = false,
  expandedChildren = [],
  onExpandChild
}: QuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [expandedChildIds, setExpandedChildIds] = useState<Set<string>>(new Set());

  const statusIcons = {
    unread: '📝',
    mastered: '✅',
    reviewing: '🔄'
  };

  const statusColors = {
    unread: 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300',
    mastered: 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/30 text-green-600 dark:text-green-400',
    reviewing: 'bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-800/30 text-yellow-600 dark:text-yellow-400'
  };

  const handleChildClick = (child: QuestionTree) => {
    setExpandedChildIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(child.id)) {
        newSet.delete(child.id);
      } else {
        newSet.add(child.id);
      }
      return newSet;
    });
    if (onExpandChild) {
      onExpandChild(child);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-all duration-200">
      {/* Main question */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {question.level > 0 && (
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded-full font-medium">
                  {question.level === 1 ? '进阶' : question.level === 2 ? '深入' : '深层'}
                </span>
              )}
              {question.tags && question.tags.split(',').slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-gray-800 dark:text-white font-medium text-lg">{question.title}</h3>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Favorite toggle */}
            {onFavoriteClick && (
              <button 
                onClick={() => onFavoriteClick(question.id)}
                className="p-2 rounded-xl transition-all hover:scale-110"
                title={isFavorite ? '取消收藏' : '添加收藏'}
              >
                {isFavorite ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                )}
              </button>
            )}
            
            {/* Status toggle */}
            <button 
              onClick={() => {
                const nextStatus: 'unread' | 'mastered' | 'reviewing' = 
                  currentStatus === 'unread' ? 'mastered' 
                  : currentStatus === 'mastered' ? 'reviewing' 
                  : 'unread';
                onStatusChange(question.id, nextStatus);
              }}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${statusColors[currentStatus]}`}
              title="点击切换状态"
            >
              {statusIcons[currentStatus]}
            </button>
          </div>
        </div>
        
        {/* Answer toggle */}
        <button 
          onClick={() => setShowAnswer(!showAnswer)}
          className="mt-3 text-blue-500 dark:text-blue-400 text-sm font-medium hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
        >
          {showAnswer ? '隐藏答案 ↓' : '查看答案 →'}
        </button>
        
        {/* Answer content */}
        {showAnswer && (
          <div className="mt-3 p-4 bg-gray-50/80 dark:bg-gray-700/50 rounded-xl text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {question.answer}
          </div>
        )}
      </div>
      
      {/* Children (进阶追问) */}
      {question.children && question.children.length > 0 && (
        <div className="border-t border-gray-100/50 dark:border-gray-700/50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>🔍</span>
            <span>进阶追问 ({question.children.length})</span>
          </div>
          <div className="space-y-2">
            {question.children.map((child) => (
              <div key={child.id}>
                <button
                  onClick={() => handleChildClick(child)}
                  className="text-left w-full px-3 py-2 bg-purple-50/50 dark:bg-purple-900/20 rounded-xl text-purple-700 dark:text-purple-300 text-sm hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                >
                  {child.title}
                </button>
                
                {/* Expanded child */}
                {expandedChildIds.has(child.id) && (
                  <div className="mt-2 ml-4">
                    <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-xl border border-purple-100/50 dark:border-purple-800/30 overflow-hidden">
                      <div className="p-3">
                        <p className="text-purple-600 dark:text-purple-400 font-medium mb-2">{child.title}</p>
                        <div className="mt-2 p-3 bg-gray-50/50 dark:bg-gray-600/50 rounded-lg text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {child.answer}
                        </div>
                      </div>
                      
                      {/* Nested children */}
                      {child.children && child.children.length > 0 && (
                        <div className="border-t border-purple-50 dark:border-purple-800/30 px-3 py-2">
                          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">💡 更深入</p>
                          <div className="space-y-1">
                            {child.children.map((nested) => (
                              <QuestionCard
                                key={nested.id}
                                question={nested}
                                currentStatus="unread"
                                onStatusChange={() => {}}
                                onFavoriteClick={onFavoriteClick}
                                isFavorite={isFavorite}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
