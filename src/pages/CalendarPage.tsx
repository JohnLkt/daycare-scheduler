import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { MonthCalendar } from '@/components/calendar/MonthCalendar';
import { ChildrenScheduleCard } from '@/components/calendar/ChildrenScheduleCard';
import { useDaycareStore } from '@/store/DaycareStore';
import { toast } from 'sonner';
import type { ChildSchedule } from '@/db/schema';

const formatDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function CalendarPage() {
  const { db, children, locations, childSchedules, voucherTransactions, refresh } =
    useDaycareStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedChildToSchedule, setSelectedChildToSchedule] = useState<number | ''>('');

  const activeBranch = locations.find((location) => location.id === selectedBranchId);
  const currentChildBookings = childSchedules.filter(
    (schedule) => schedule.date === selectedDate && schedule.branchId === selectedBranchId,
  );
  const isFull = activeBranch ? currentChildBookings.length >= activeBranch.capacity : false;

  const getVoucherBalance = (childId: number) => {
    return voucherTransactions
      .filter((transaction) => transaction.childId === childId)
      .reduce((balance, transaction) => {
        if (transaction.type === 'topup') {
          return balance + transaction.amount;
        }
        return balance - transaction.amount;
      }, 0);
  };

  // Sat=6, Sun=0
  const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

  const handleScheduleChild = async () => {
    if (!db || selectedBranchId === null || selectedChildToSchedule === '') {
      return;
    }
    const childId = Number(selectedChildToSchedule);
    const child = children.find((c) => c.id === childId);
    if (!child) {
      return;
    }

    // Check voucher balance
    if (child.voucherType === 'voucher') {
      const balance = getVoucherBalance(childId);
      if (balance <= 0) {
        toast.error('Insufficient voucher balance', {
          description: `${child.name} has no remaining vouchers.`,
        });
        return;
      }
    }

    // Calculate weekdays within the next 30 calendar days from selected date
    const startDate = new Date(selectedDate);
    const endDate = new Date(startDate);

    endDate.setDate(endDate.getDate() + 30);

    const scheduleDates: string[] = [];

    const currentDay = new Date(startDate);
    while (currentDay < endDate) {
      if (!isWeekend(currentDay)) {
        const dateKey = formatDateKey(currentDay);

        // Check branch capacity for each day before committing
        const existingBookings = childSchedules.filter(
          (s) => s.date === dateKey && s.branchId === selectedBranchId,
        );

        if (!activeBranch || existingBookings.length >= activeBranch.capacity) {
          // Cancel everything and show error for first full day
          toast.error('Cannot schedule more children', {
            description: `The branch capacity is reached on ${dateKey}`,
          });

          return;
        }

        scheduleDates.push(dateKey);
      }

      currentDay.setDate(currentDay.getDate() + 1);
    }

    // Create all schedules at once (optimistic batch) with shared scheduleGroupId
    const scheduleGroupId = crypto.randomUUID();

    for (const dateKey of scheduleDates) {
      await db.add('childSchedules', {
        childId,
        branchId: selectedBranchId,
        date: dateKey,
        scheduleGroupId,
      });
    }

    toast.success(`Scheduled ${scheduleDates.length} days`);
    setSelectedChildToSchedule('');
    await refresh();
  };

  const handleRemoveChildSchedule = async (schedule: ChildSchedule) => {
    if (!db || !schedule.scheduleGroupId) {
      return;
    }

    // Delete all schedules in the same batch (same scheduleGroupId), but NOT adjacent batches
    // Find all related schedules
    let deletedCount = 0;
    const relatedSchedules = childSchedules.filter(
      (s) => s.scheduleGroupId === schedule.scheduleGroupId,
    );

    for (const rel of relatedSchedules) {
      await db.delete('childSchedules', rel.id!);
      deletedCount++;

      // Refund voucher balance for each cancelled voucher child in this batch
      const child = children.find((c) => c.id === rel.childId);
      if (child?.voucherType === 'voucher') {
        await db.add('voucherTransactions', {
          childId: rel.childId,
          date: selectedDate,
          type: 'topup',
          amount: 1,
        });
      }
    }

    toast.success(`Removed ${deletedCount} schedule(s)`);
    setSelectedChildToSchedule('');

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
        <div className="flex items-center justify-between border-b pb-2">
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
        <div className="grid md:grid-cols-2 gap-6">
          <ChildrenScheduleCard
            currentChildBookings={currentChildBookings}
            children={children}
            selectedBranchId={selectedBranchId}
            selectedChildToSchedule={selectedChildToSchedule}
            isFull={isFull}
            onSelectChild={setSelectedChildToSchedule}
            onScheduleChild={handleScheduleChild}
            onRemoveChild={handleRemoveChildSchedule}
          />
        </div>
      </div>
    </div>
  );
}
