import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Location, ChildSchedule, StaffSchedule } from '@/db/schema';
import type { CalendarDay } from '@/types/daycare';

interface MonthCalendarProps {
  currentMonth: Date;
  calendarDays: CalendarDay[];
  selectedDate: string;
  selectedBranchId: number | null;
  locations: Location[];
  activeBranch?: Location;
  childSchedules: ChildSchedule[];
  staffSchedules: StaffSchedule[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateStr: string) => void;
  onSelectBranch: (branchId: number) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  currentMonth,
  calendarDays,
  selectedDate,
  selectedBranchId,
  locations,
  activeBranch,
  childSchedules,
  staffSchedules,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  onSelectBranch,
}) => {
  return (
    <div className="space-y-4">
      {/* Month Navigation & Branch Select */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-4 items-center justify-center">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={onPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-bold min-w-[160px] text-center">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <Button variant="outline" size="icon" onClick={onNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-1">
            <Label htmlFor="branch-select" className="text-xs text-muted-foreground">
              Select Branch
            </Label>
            <Select
              value={selectedBranchId ? String(selectedBranchId) : ''}
              onValueChange={(val) => onSelectBranch(Number(val))}
            >
              <SelectTrigger id="branch-select" className="w-[200px] h-9 text-sm">
                <SelectValue placeholder="Choose branch" children={activeBranch?.branchName} />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={String(loc.id)}>
                    {loc.branchName} (Cap: {loc.capacity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid Calendar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-muted-foreground mb-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-1 bg-muted rounded-md">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((dayObj) => {
              const isSelected = dayObj.dateStr === selectedDate;
              const dayKids = childSchedules.filter(
                (cs) => cs.date === dayObj.dateStr && cs.branchId === Number(selectedBranchId)
              );
              const dayStaff = staffSchedules.filter(
                (ss) => ss.date === dayObj.dateStr && ss.branchId === Number(selectedBranchId)
              );
              const dayIsFull = activeBranch ? dayKids.length >= activeBranch.capacity : false;

              return (
                <button
                  key={dayObj.dateStr}
                  onClick={() => onSelectDate(dayObj.dateStr)}
                  className={`min-h-[85px] p-2 rounded-lg text-left border transition-colors flex flex-col justify-between ${
                    !dayObj.isCurrentMonth
                      ? 'bg-muted/40 text-muted-foreground border-transparent'
                      : 'bg-card border-border hover:bg-accent'
                  } ${isSelected ? 'border-primary ring-1 ring-primary' : ''}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`text-xs font-bold ${isSelected ? 'text-primary' : ''}`}>
                      {dayObj.date.getDate()}
                    </span>
                    {dayIsFull && dayObj.isCurrentMonth && (
                      <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                        Full
                      </Badge>
                    )}
                  </div>

                  {dayObj.isCurrentMonth && (
                    <div className="space-y-1 mt-1 text-[11px] w-full">
                      <div className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex justify-between">
                        <span>Kids:</span>
                        <span className="font-semibold">
                          {dayKids.length}
                          {activeBranch ? `/${activeBranch.capacity}` : ''}
                        </span>
                      </div>

                      <div className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex justify-between">
                        <span>Staff:</span>
                        <span className="font-semibold">{dayStaff.length}</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};