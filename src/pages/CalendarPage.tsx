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
      .reduce(
        (balance, transaction) =>
          transaction.type === 'topup'
            ? balance + transaction.amount
            : balance - transaction.amount,
        0,
      );
  };

  const handleScheduleChild = async () => {
    if (!db || selectedBranchId === null || selectedChildToSchedule === '') {
      return;
    }
    const childId = Number(selectedChildToSchedule);
    const child = children.find((c) => c.id === childId);
    if (!child) {
      return;
    }

    const selected = new Date(selectedDate);
    const dayOfWeek = selected.getDay();

    // Sundays are unavailable
    if (dayOfWeek === 0) {
      toast.error('Scheduling unavailable', {
        description: 'Children cannot be scheduled on Sundays.',
      });

      return;
    }

    // Weekend vouchers only work on Saturdays
    if (dayOfWeek === 6 && child.voucherType !== 'weekend-voucher') {
      toast.error('Invalid schedule', {
        description: 'Only Weekend Voucher children can be scheduled on Saturdays.',
      });

      return;
    }

    // Weekend vouchers cannot be used on weekdays
    if (dayOfWeek !== 6 && child.voucherType === 'weekend-voucher') {
      toast.error('Invalid schedule', {
        description: 'Weekend Voucher children can only be scheduled on Saturdays.',
      });

      return;
    }

    // Monthly schedules create a weekday batch
    if (child.voucherType === 'monthly') {
      const scheduleDates: string[] = [];
      const endDate = new Date(selected);

      endDate.setDate(endDate.getDate() + 30);

      const currentDay = new Date(selected);

      while (currentDay < endDate) {
        const currentDayOfWeek = currentDay.getDay();

        if (currentDayOfWeek !== 0 && currentDayOfWeek !== 6) {
          const dateKey = formatDateKey(currentDay);

          const existingBookings = childSchedules.filter(
            (schedule) => schedule.date === dateKey && schedule.branchId === selectedBranchId,
          );

          const childAlreadyScheduled = existingBookings.some(
            (schedule) => schedule.childId === childId,
          );

          if (childAlreadyScheduled) {
            toast.error('Schedule conflict', {
              description: `${child.name} is already scheduled on ${dateKey}.`,
            });

            return;
          }

          if (!activeBranch || existingBookings.length >= activeBranch.capacity) {
            toast.error('Branch capacity reached', {
              description: `The branch is full on ${dateKey}.`,
            });

            return;
          }

          scheduleDates.push(dateKey);
        }

        currentDay.setDate(currentDay.getDate() + 1);
      }

      const scheduleGroupId = crypto.randomUUID();

      for (const date of scheduleDates) {
        await db.add('childSchedules', {
          childId,
          branchId: selectedBranchId,
          date,
          scheduleGroupId,
        });
      }

      toast.success(`Scheduled ${scheduleDates.length} weekdays`);

      setSelectedChildToSchedule('');

      await refresh();

      return;
    }

    // Check voucher availability
    if (['voucher', 'weekend-voucher'].includes(child.voucherType)) {
      const balance = getVoucherBalance(childId);

      if (balance <= 0) {
        toast.error('Insufficient voucher balance', {
          description: `${child.name} has no remaining vouchers.`,
        });

        return;
      }
    }

    // Check branch capacity
    if (isFull) {
      toast.error('Branch capacity reached', {
        description: 'This branch has reached its maximum child capacity.',
      });

      return;
    }

    // Prevent duplicate schedule
    const alreadyScheduled = currentChildBookings.some((schedule) => schedule.childId === childId);

    if (alreadyScheduled) {
      toast.error('Already scheduled', {
        description: `${child.name} is already scheduled on this date.`,
      });

      return;
    }

    await db.add('childSchedules', { childId, branchId: selectedBranchId, date: selectedDate });

    // Consume voucher
    if (['voucher', 'weekend-voucher'].includes(child.voucherType)) {
      await db.add('voucherTransactions', {
        childId,
        date: selectedDate,
        type: 'usage',
        amount: 1,
      });
    }

    toast.success('Child scheduled successfully.');

    setSelectedChildToSchedule('');

    await refresh();
  };

  const handleRemoveChildSchedule = async (schedule: ChildSchedule) => {
    if (!db) {
      return;
    }

    const schedulesToRemove = schedule.scheduleGroupId
      ? childSchedules.filter((item) => item.scheduleGroupId === schedule.scheduleGroupId)
      : [schedule];

    for (const item of schedulesToRemove) {
      await db.delete('childSchedules', item.id!);

      const child = children.find((c) => c.id === item.childId);

      // Refund voucher usage
      if (child && ['voucher', 'weekend-voucher'].includes(child.voucherType)) {
        await db.add('voucherTransactions', {
          childId: item.childId,
          date: item.date,
          type: 'topup',
          amount: 1,
        });
      }
    }

    toast.success(`Removed ${schedulesToRemove.length} schedule(s)`);

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
              {currentChildBookings.length}/{activeBranch.capacity} Kids
            </Badge>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <ChildrenScheduleCard
            currentChildBookings={currentChildBookings}
            children={children}
            selectedBranchId={selectedBranchId}
            selectedDate={selectedDate}
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
