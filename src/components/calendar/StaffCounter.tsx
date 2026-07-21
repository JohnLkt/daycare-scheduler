import React from 'react';

interface StaffCounterProps {
  count: number;
}

export const StaffCounter: React.FC<StaffCounterProps> = ({ count }) => (
  <div className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex justify-between">
    <span>Staff:</span>
    <span className="font-semibold">{count}</span>
  </div>
);
