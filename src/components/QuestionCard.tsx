import { useState, useRef, useCallback, useMemo } from 'react';
import type { QuestionTree } from '../types';
import { renderMarkdown } from '../utils/markdown';

/* ─── Status toggle ─── */
function StatusButton({ status, onChange }: { status: string; onChange: () => void }) {
  const icons: Record<string, string> = { unread: '📝', mastered: '✅', reviewing: '🔄' };
  const titles: Record<string, string> = { unread: '未学习', mastered: '已掌握', reviewing: '待复习' };
  return (
    <button onClick={onChange} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:scale-110 active:scale-95" title={titles[status] || '切换状态'}>
      {icons[status] || '📝'}
    </button>
  );
}

/* ─── Favorite toggle ─── */
function FavButton({ isFavorite, onClick }: { isFavorite: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="shrink-0 p-1 rounded-lg transition-all hover:scale-110 active:scale-95" title={isFavorite ? '取消收藏' : '添加收藏'}>
      <svg className={`w-5 h-5 transition-colors ${isFavorite ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
      </svg>
    </button>
  );
}

/* ─── Markdown answer ─── */
function AnswerBlock({ answer }: { answer: string }) {
  const html = useMemo(() => renderMarkdown(answer), [answer]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const pre = (e.target as HTMLElement).closest('pre');
    if (!pre) return;
    const code = pre.querySelector('code')?.textContent;
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        pre.style.outline = '2px solid rgb(59 130 246)';
        setTimeout(() => { pre.style.outline = ''; }, 600);
      });
    }
  }, []);

  return (
    <div
      className="md-answer text-gray-700 dark:text-gray-300 leading-relaxed text-[15px] [&_p]:mb-2 [&_p]:last:mb-0"
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/* ─── Sub-question (recursive, all levels) ─── */
function SubQuestion({
  question,
  depth,
  onStatusChange,
  onFavoriteClick,
  progress,
  favorites,
}: {
  question: QuestionTree;
  depth: number;
  onStatusChange: (id: string, status: 'unread' | 'mastered' | 'reviewing') => void;
  onFavoriteClick: (id: string) => void;
  progress: Record<string, 'unread' | 'mastered' | 'reviewing'>;
  favorites: Set<string>;
}) {
  const [collapsed, setCollapsed] = useState(depth >= 2);
  const hasChildren = question.children && question.children.length > 0;

  const colors = ['border-l-blue-400', 'border-l-purple-400', 'border-l-pink-400', 'border-l-orange-400', 'border-l-teal-400', 'border-l-indigo-400'];
  const borderColor = colors[depth % colors.length];

  return (
    <div className={`ml-4 border-l-2 ${borderColor} pl-4 my-3`}>
      <div className="flex items-start gap-2">
        <button onClick={() => setCollapsed(!collapsed)} className="shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-transform" title={collapsed ? '展开' : '收起'}>
          <svg className={`w-4 h-4 transition-transform duration-200 ${collapsed ? '' : 'rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-gray-800 dark:text-white text-[15px]">{question.title}</h4>
            {question.tags && question.tags.split(',').slice(0, 2).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded">{tag}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <FavButton isFavorite={favorites.has(question.id)} onClick={() => onFavoriteClick(question.id)} />
          <StatusButton status={progress[question.id] || 'unread'} onChange={() => {
            const cur = progress[question.id] || 'unread';
            const next = cur === 'unread' ? 'mastered' : cur === 'mastered' ? 'reviewing' : 'unread';
            onStatusChange(question.id, next);
          }} />
        </div>
      </div>
      {!collapsed && (
        <div className="mt-2">
          <div className="bg-gray-50/80 dark:bg-gray-800/60 rounded-xl p-4">
            <AnswerBlock answer={question.answer} />
          </div>
          {hasChildren && question.children!.map(child => (
            <SubQuestion key={child.id} question={child} depth={depth + 1} onStatusChange={onStatusChange} onFavoriteClick={onFavoriteClick} progress={progress} favorites={favorites} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main QuestionCard ─── */
interface QuestionCardProps {
  question: QuestionTree;
  onStatusChange: (questionId: string, status: 'unread' | 'mastered' | 'reviewing') => void;
  onFavoriteClick?: (questionId: string) => void;
  currentStatus: 'unread' | 'mastered' | 'reviewing';
  isFavorite?: boolean;
  progress: Record<string, 'unread' | 'mastered' | 'reviewing'>;
  favorites: Set<string>;
  /** Called when user expands sub-questions for the first time */
  onLoadChildren?: (rootId: string) => Promise<void>;
}

export function QuestionCard({
  question,
  onStatusChange,
  onFavoriteClick,
  currentStatus,
  isFavorite = false,
  progress,
  favorites,
  onLoadChildren,
}: QuestionCardProps) {
  const [childrenExpanded, setChildrenExpanded] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const hasChildren = question.children && question.children.length > 0;

  const statusBg: Record<string, string> = {
    unread: 'bg-white dark:bg-gray-800/80',
    mastered: 'bg-green-50/50 dark:bg-green-900/10',
    reviewing: 'bg-yellow-50/50 dark:bg-yellow-900/10',
  };
  const statusBorder: Record<string, string> = {
    unread: 'border-gray-200/60 dark:border-gray-700/40',
    mastered: 'border-green-200/60 dark:border-green-800/30',
    reviewing: 'border-yellow-200/60 dark:border-yellow-800/30',
  };

  const handleExpandChildren = useCallback(async () => {
    if (!hasChildren && onLoadChildren) {
      // Children not loaded yet — load them
      setLoadingChildren(true);
      try {
        await onLoadChildren(question.id);
        setChildrenExpanded(true);
      } catch (err) {
        console.error('Failed to load children:', err);
      }
      setLoadingChildren(false);
    } else {
      setChildrenExpanded(!childrenExpanded);
    }
  }, [hasChildren, onLoadChildren, question.id, childrenExpanded]);

  // Count total descendants
  const totalDescendants = useMemo(() => {
    if (!hasChildren) return 0;
    const count = (nodes: QuestionTree[]): number => nodes.reduce((sum, n) => sum + 1 + (n.children ? count(n.children) : 0), 0);
    return count(question.children!);
  }, [hasChildren, question.children]);

  return (
    <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-200 ${statusBg[currentStatus]} ${statusBorder[currentStatus]}`}>
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              {question.tags && question.tags.split(',').slice(0, 4).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full font-medium">{tag}</span>
              ))}
            </div>
            <h3 className="text-gray-900 dark:text-white font-semibold text-lg leading-snug">{question.title}</h3>
          </div>
          <div className="flex items-center gap-1 shrink-0 pt-1">
            {onFavoriteClick && <FavButton isFavorite={isFavorite} onClick={() => onFavoriteClick(question.id)} />}
            <StatusButton status={currentStatus} onChange={() => {
              const next: Record<string, 'unread' | 'mastered' | 'reviewing'> = { unread: 'mastered', mastered: 'reviewing', reviewing: 'unread' };
              onStatusChange(question.id, next[currentStatus]);
            }} />
          </div>
        </div>
      </div>

      {/* Answer — always visible */}
      <div className="px-5 py-4">
        <AnswerBlock answer={question.answer} />
      </div>

      {/* Sub-questions section */}
      <div className="border-t border-gray-100 dark:border-gray-700/50 px-5 pb-4">
        <button
          onClick={handleExpandChildren}
          disabled={loadingChildren}
          className="flex items-center gap-2 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
        >
          <svg className={`w-4 h-4 transition-transform duration-200 ${childrenExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
          {loadingChildren ? '加载中...' : hasChildren ? `进阶追问 (${totalDescendants})` : '展开追问'}
        </button>

        {childrenExpanded && hasChildren && question.children!.map(child => (
          <SubQuestion
            key={child.id}
            question={child}
            depth={0}
            onStatusChange={onStatusChange}
            onFavoriteClick={onFavoriteClick || (() => {})}
            progress={progress}
            favorites={favorites}
          />
        ))}
      </div>
    </div>
  );
}
