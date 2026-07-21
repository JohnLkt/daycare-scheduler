import { create } from 'zustand';
import type { IDBPDatabase } from 'idb';

import { initDB } from '@/db/schema';

import type {
  DaycareDB,
  Child,
  Staff,
  Location,
  ChildSchedule,
  StaffSchedule,
  VoucherTransaction,
} from '@/db/schema';

interface DaycareStore {
  db: IDBPDatabase<DaycareDB> | null;

  children: Child[];
  staff: Staff[];
  locations: Location[];

  childSchedules: ChildSchedule[];
  staffSchedules: StaffSchedule[];

  voucherTransactions: VoucherTransaction[];

  initialized: boolean;
  loading: boolean;

  initialize: () => Promise<void>;

  refresh: () => Promise<void>;

  updateStore: (
    data: Partial<Omit<DaycareStore, 'initialize' | 'refresh' | 'updateStore'>>,
  ) => void;
}

export const useDaycareStore = create<DaycareStore>((set, get) => ({
  db: null,

  children: [],
  staff: [],
  locations: [],

  childSchedules: [],
  staffSchedules: [],

  voucherTransactions: [],

  initialized: false,

  loading: true,

  initialize: async () => {
    if (get().initialized) {
      return;
    }

    set({ loading: true });

    const db = await initDB();

    set({ db, initialized: true });

    await get().refresh();

    set({ loading: false });
  },

  refresh: async () => {
    const db = get().db;

    if (!db) {
      return;
    }

    const [children, staff, locations, childSchedules, staffSchedules, voucherTransactions] =
      await Promise.all([
        db.getAll('child'),

        db.getAll('staff'),

        db.getAll('locations'),

        db.getAll('childSchedules'),

        db.getAll('staffSchedules'),

        db.getAll('voucherTransactions'),
      ]);

    set({
      children,

      staff,

      locations,

      childSchedules,

      staffSchedules,

      voucherTransactions,
    });
  },

  updateStore: (data) => {
    set(data);
  },
}));
