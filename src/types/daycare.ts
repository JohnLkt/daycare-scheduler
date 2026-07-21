export type ActiveTab = 'calendar' | 'parents' | 'staff' | 'locations';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  dateStr: string;
}

export type {
  Parent,
  Staff,
  Location,
  ChildSchedule,
  StaffSchedule,
  DaycareDB,
} from '@/db/schema';