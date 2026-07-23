import { create } from 'zustand';
import type { IDBPDatabase } from 'idb';

import { initDB } from '@/db/schema';

import type { DaycareDB, Child, Location, ChildSchedule, VoucherTransaction } from '@/db/schema';

interface DaycareStore {
  db: IDBPDatabase<DaycareDB> | null;

  children: Child[];
  locations: Location[];

  childSchedules: ChildSchedule[];

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
  locations: [],

  childSchedules: [],

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

    const [children, locations, childSchedules, voucherTransactions] = await Promise.all([
      db.getAll('child'),

      db.getAll('locations'),

      db.getAll('childSchedules'),

      db.getAll('voucherTransactions'),
    ]);

    set({
      children,

      locations,

      childSchedules,

      voucherTransactions,
    });
  },

  updateStore: (data) => {
    set(data);
  },
}));
