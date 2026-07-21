import React from 'react';

interface ChildrenCounterProps {
  count: number;
  capacity?: number;
}

export const ChildrenCounter: React.FC<ChildrenCounterProps> = ({ count, capacity }) => {
  let bgClass = 'bg-muted text-muted-foreground';

  if (capacity && count > 0) {
    if (count >= capacity) {
      bgClass = 'bg-red-500 text-white';
    } else if (count === 1) {
      bgClass = 'bg-green-500 text-white';
    } else {
      bgClass = 'bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 text-white';
    }
  }

  return (
    <div className={`px-1.5 py-0.5 rounded flex justify-between ${bgClass}`}>
      <span>Children:</span>
      <span className="font-semibold">
        {count}
        {capacity ? `/${capacity}` : ''}
      </span>
    </div>
  );
};
