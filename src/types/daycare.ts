export type ActiveTab = 'calendar' | 'child' | 'staff' | 'locations';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  dateStr: string;
}

export type {
  Child,
  Staff,
  Location,
  ChildSchedule,
  StaffSchedule,
  DaycareDB,
  VoucherTransaction,
} from '@/db/schema';
