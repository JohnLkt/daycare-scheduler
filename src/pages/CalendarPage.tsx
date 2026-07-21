import { useState } from 'react';

import { Badge } from '@/components/ui/badge';

import { MonthCalendar } from '@/components/calendar/MonthCalendar';
import { ChildrenScheduleCard } from '@/components/calendar/ChildrenScheduleCard';
import { StaffScheduleCard } from '@/components/calendar/StaffScheduleCard';

import { useDaycareStore } from '@/store/DaycareStore';

const formatDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
};

export default function CalendarPage() {
  const {
    db,

    children,
    staff,
    locations,

    childSchedules,
    staffSchedules,

    refresh,
  } = useDaycareStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));

  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  const [selectedChildToSchedule, setSelectedChildToSchedule] = useState<number | ''>('');

  const [selectedStaffToSchedule, setSelectedStaffToSchedule] = useState<number | ''>('');

  const activeBranch = locations.find((location) => location.id === selectedBranchId);

  const currentChildBookings = childSchedules.filter(
    (schedule) => schedule.date === selectedDate && schedule.branchId === selectedBranchId,
  );

  const currentStaffBookings = staffSchedules.filter(
    (schedule) => schedule.date === selectedDate && schedule.branchId === selectedBranchId,
  );

  const isFull = activeBranch ? currentChildBookings.length >= activeBranch.capacity : false;

  const handleScheduleChild = async () => {
    if (!db || selectedBranchId === null || selectedChildToSchedule === '') {
      return;
    }

    if (isFull) {
      alert('Branch capacity reached.');
      return;
    }

    await db.add('childSchedules', {
      childId: Number(selectedChildToSchedule),

      branchId: selectedBranchId,

      date: selectedDate,
    });

    setSelectedChildToSchedule('');

    await refresh();
  };

  const handleScheduleStaff = async () => {
    if (!db || selectedBranchId === null || selectedStaffToSchedule === '') {
      return;
    }

    await db.add('staffSchedules', {
      staffId: Number(selectedStaffToSchedule),

      branchId: selectedBranchId,

      date: selectedDate,
    });

    setSelectedStaffToSchedule('');

    await refresh();
  };

  const generateMonthDays = (year: number, month: number) => {
    const first = new Date(year, month, 1);

    const start = new Date(first);

    const offset = (first.getDay() + 6) % 7;

    start.setDate(first.getDate() - offset);

    return Array.from({ length: 35 }, (_, index) => {
      const date = new Date(start);

      date.setDate(start.getDate() + index);

      return {
        date,

        dateStr: formatDateKey(date),

        isCurrentMonth: date.getMonth() === month,

        monthOffset: date.getMonth() < month ? -1 : date.getMonth() > month ? 1 : 0,
      };
    });
  };

  const calendarDays = generateMonthDays(currentMonth.getFullYear(), currentMonth.getMonth());

  return (
    <div className="space-y-6">
      <MonthCalendar
        currentMonth={currentMonth}

        calendarDays={calendarDays}

        selectedDate={selectedDate}

        selectedBranchId={selectedBranchId}

        locations={locations}

        activeBranch={activeBranch}

        childSchedules={childSchedules}

        staffSchedules={staffSchedules}

        onPrevMonth={() =>
          setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
        }

        onNextMonth={() =>
          setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
        }

        onSelectDate={setSelectedDate}

        onSelectBranch={setSelectedBranchId}
      />

      <div className="space-y-4">
        <div
          className="
          flex
          items-center
          justify-between
          border-b
          pb-2
        "
        >
          <h3 className="font-bold text-lg">
            Details for
            <span className="text-primary ml-1">{selectedDate}</span>
          </h3>

          {activeBranch && (
            <Badge variant={isFull ? 'destructive' : 'secondary'}>
              {currentChildBookings.length}/{activeBranch.capacity}
              Kids
            </Badge>
          )}
        </div>

        <div
          className="
          grid
          md:grid-cols-2
          gap-6
        "
        >
          <ChildrenScheduleCard
            currentChildBookings={currentChildBookings}

            children={children}

            selectedBranchId={selectedBranchId}

            selectedChildToSchedule={selectedChildToSchedule}

            isFull={isFull}

            onSelectChild={setSelectedChildToSchedule}

            onScheduleChild={handleScheduleChild}
          />

          <StaffScheduleCard
            currentStaffBookings={currentStaffBookings}

            staff={staff}

            selectedStaffToSchedule={selectedStaffToSchedule}

            onSelectStaff={setSelectedStaffToSchedule}

            onScheduleStaff={handleScheduleStaff}
          />
        </div>
      </div>
    </div>
  );
}
