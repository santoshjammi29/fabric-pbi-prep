'use client';

import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface VirtualizedListProps<T> {
  items: T[];
  estimateSize?: number;
  overscan?: number;
  className?: string;
  containerClassName?: string;
  getItemKey?: (item: T, index: number) => string | number;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyState?: React.ReactNode;
}

export function VirtualizedList<T>({
  items,
  estimateSize = 120,
  overscan = 5,
  className = '',
  containerClassName = '',
  getItemKey,
  renderItem,
  emptyState,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    getItemKey: (index) => (getItemKey ? getItemKey(items[index], index) : index),
  });

  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={`overflow-auto relative ${containerClassName}`}
      tabIndex={0}
      role="feed"
      aria-label="Virtualized content feed"
    >
      <div
        className={`w-full relative ${className}`}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {virtualItems.map((virtualRow) => {
          const item = items[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              className="absolute top-0 left-0 w-full"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
