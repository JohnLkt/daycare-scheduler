export type ActiveTab = 'calendar' | 'child' | 'locations';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  dateStr: string;
}

export type { Child, Location, ChildSchedule, DaycareDB, VoucherTransaction } from '@/db/schema';
