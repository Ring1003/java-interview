import { useState, useEffect, useCallback, type ReactNode } from 'react';

/**
 * Progressive rendering — render items in batches for large lists.
 * Resets visible count when items change (e.g., category switch).
 */
export function ProgressiveList({
  items,
  renderFn,
  batchSize = 20,
  className,
}: {
  items: any[];
  renderFn: (item: any, index: number) => ReactNode;
  batchSize?: string | number;
  className?: string;
}) {
  const batchSizeNum = typeof batchSize === 'number' ? batchSize : 20;
  const [visibleCount, setVisibleCount] = useState(batchSizeNum);

  // Reset when items reference changes
  useEffect(() => {
    setVisibleCount(batchSizeNum);
  }, [items, batchSizeNum]);

  const handleShowMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + batchSizeNum, items.length));
  }, [batchSizeNum, items.length]);

  const effectiveCount = Math.min(visibleCount, items.length);

  // Don't use progressive list for small lists
  if (items.length <= batchSizeNum) {
    return <div className={className}><div className="space-y-4">{items.map((item, idx) => renderFn(item, idx))}</div></div>;
  }

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
