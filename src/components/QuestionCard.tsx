import { useState } from 'react';
import type { QuestionTree } from '../types';

interface QuestionCardProps {
  question: QuestionTree;
  onStatusChange: (questionId: string, status: 'unread' | 'mastered' | 'reviewing') => void;
  currentStatus: 'unread' | 'mastered' | 'reviewing';
  expandedChildren?: QuestionTree[];
  onExpandChild?: (child: QuestionTree) => void;
}

export function QuestionCard({ 
  question, 
  onStatusChange, 
  currentStatus,
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
    unread: 'bg-gray-100 hover:bg-gray-200',
    mastered: 'bg-green-100 hover:bg-green-200',
    reviewing: 'bg-yellow-100 hover:bg-yellow-200'
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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden transition-all duration-200">
      {/* Main question */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {question.level > 0 && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full font-medium">
                  {question.level === 1 ? '进阶' : question.level === 2 ? '深入' : '深层'}
                </span>
              )}
              {question.tags && question.tags.split(',').map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-500 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-gray-800 font-medium text-lg">{question.title}</h3>
          </div>
          
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
          >
            {statusIcons[currentStatus]}
          </button>
        </div>
        
        {/* Answer toggle */}
        <button 
          onClick={() => setShowAnswer(!showAnswer)}
          className="mt-3 text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
        >
          {showAnswer ? '隐藏答案 ↓' : '查看答案 →'}
        </button>
        
        {/* Answer content */}
        {showAnswer && (
          <div className="mt-3 p-4 bg-gray-50/80 rounded-xl text-gray-600 leading-relaxed whitespace-pre-wrap">
            {question.answer}
          </div>
        )}
      </div>
      
      {/* Children (进阶追问) */}
      {question.children && question.children.length > 0 && (
        <div className="border-t border-gray-100/50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>🔍</span>
            <span>进阶追问 ({question.children.length})</span>
          </div>
          <div className="space-y-2">
            {question.children.map((child) => (
              <div key={child.id}>
                <button
                  onClick={() => handleChildClick(child)}
                  className="text-left w-full px-3 py-2 bg-purple-50/50 rounded-xl text-purple-700 text-sm hover:bg-purple-50 transition-colors"
                >
                  {child.title}
                </button>
                
                {/* Expanded child */}
                {expandedChildIds.has(child.id) && (
                  <div className="mt-2 ml-4">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-purple-100/50 overflow-hidden">
                      <div className="p-3">
                        <p className="text-purple-600 font-medium mb-2">{child.title}</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAnswer(!showAnswer);
                          }}
                          className="text-blue-500 text-xs hover:text-blue-600"
                        >
                          {showAnswer ? '隐藏' : '查看答案'}
                        </button>
                        <div className="mt-2 p-3 bg-gray-50/50 rounded-lg text-gray-600 text-sm leading-relaxed">
                          {child.answer}
                        </div>
                      </div>
                      
                      {/* Nested children */}
                      {child.children && child.children.length > 0 && (
                        <div className="border-t border-purple-50 px-3 py-2">
                          <p className="text-xs text-gray-400 mb-1">💡 更深入</p>
                          {child.children.map((nested) => (
                            <button
                              key={nested.id}
                              className="text-left w-full px-2 py-1 bg-orange-50/50 rounded-lg text-orange-600 text-xs hover:bg-orange-50"
                            >
                              {nested.title}
                            </button>
                          ))}
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