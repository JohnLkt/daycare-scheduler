import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { CalendarDay } from '@/types/daycare';
import type { ChildSchedule, Location } from '@/db/schema';
import { ChildrenCounter } from './ChildrenCounter';

interface CalendarDayCardProps {
  day: CalendarDay;
  selectedDate: string;
  selectedBranchId: number | null;
  activeBranch?: Location;
  childSchedules: ChildSchedule[];
  onSelectDate: (date: string) => void;
}

export const CalendarDayCard: React.FC<CalendarDayCardProps> = ({
  day,
  selectedDate,
  selectedBranchId,
  activeBranch,
  childSchedules,
  onSelectDate,
}) => {
  const isSelected = day.dateStr === selectedDate;
  const dayChildren = childSchedules.filter(
    (cs) => cs.date === day.dateStr && cs.branchId === Number(selectedBranchId),
  );
  const isFull = activeBranch != null && dayChildren.length >= activeBranch.capacity;

  return (
    <button
      onClick={() => onSelectDate(day.dateStr)}
      className={`min-h-[85px] p-2 rounded-lg text-left border transition-colors flex flex-col justify-between ${
        !day.isCurrentMonth
          ? 'bg-muted/40 text-muted-foreground border-transparent'
          : 'bg-card border-border hover:bg-accent'
      } ${isSelected ? 'border-primary ring-1 ring-primary' : ''}`}
    >
      <div className="flex justify-between items-center">
        <span className={`text-xs font-bold ${isSelected ? 'text-primary' : ''}`}>
          {day.date.getDate()}
        </span>
        {isFull && day.isCurrentMonth && (
          <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
            Full
          </Badge>
        )}
      </div>
      {day.isCurrentMonth && (
        <div className="space-y-1 mt-1 text-[11px]">
          <ChildrenCounter count={dayChildren.length} capacity={activeBranch?.capacity} />
        </div>
      )}
    </button>
  );
};
