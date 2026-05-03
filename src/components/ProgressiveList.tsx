import { useState, useCallback, type ReactNode } from 'react';

/**
 * Progressive rendering — render items in batches for large lists.
 * Much simpler and more reliable than full virtual scrolling.
 */
export function ProgressiveList({
  items,
  renderFn,
  batchSize = 20,
  className,
}: {
  items: any[];
  renderFn: (item: any, index: number) => ReactNode;
  batchSize?: number;
  className?: string;
}) {
  const [visibleCount, setVisibleCount] = useState(batchSize);

  // Reset when items change
  const handleShowMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + batchSize, items.length));
  }, [batchSize, items.length]);

  // Reset visible count when items change
  const effectiveCount = Math.min(visibleCount, items.length);

  return (
    <div className={className}>
      <div className="space-y-4">
        {items.slice(0, effectiveCount).map((item, idx) => renderFn(item, idx))}
      </div>
      {effectiveCount < items.length && (
        <div className="text-center py-6">
          <button
            onClick={handleShowMore}
            className="px-6 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            加载更多（还剩 {items.length - effectiveCount} 题）
          </button>
        </div>
      )}
    </div>
  );
}
