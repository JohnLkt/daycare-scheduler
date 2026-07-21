import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

export interface Child {
  id?: number;
  name: string;
  voucherType: 'monthly' | 'daily' | 'voucher';
  branchIds: number[];
}

export interface Staff {
  id?: number;
  name: string;
  number: string;
  role: 'Teacher' | 'Assistant' | 'Admin' | 'Caregiver';
}

export interface Location {
  id?: number;
  branchName: string;
  capacity: number;
}

export interface VoucherTransaction {
  id?: number;
  childId: number;
  date: string;
  type: 'topup' | 'usage';
  amount: number;
}

export interface ChildSchedule {
  id?: number;
  date: string; // YYYY-MM-DD
  branchId: number;
  childId: number;
  // only set for periodic schedules
  scheduleGroupId?: string;
  // only stored on the first record
  scheduleStartDate?: string;
}

export interface StaffSchedule {
  id?: number;
  date: string; // YYYY-MM-DD
  branchId: number;
  staffId: number;
}

export interface DaycareDB extends DBSchema {
  child: { key: number; value: Child; indexes: { 'by-name': string } };
  staff: { key: number; value: Staff };
  locations: { key: number; value: Location; indexes: { 'by-branch': string } };
  childSchedules: {
    key: number;
    value: ChildSchedule;
    indexes: { 'by-date-branch': [string, number] };
  };
  voucherTransactions: {
    key: number;
    value: VoucherTransaction;
    indexes: { 'by-child': number; 'by-date': string };
  };
  staffSchedules: {
    key: number;
    value: StaffSchedule;
    indexes: { 'by-date-branch': [string, number] };
  };
}

const DB_NAME = 'daycare-scheduler-db';
const DB_VERSION = 5;
export async function initDB(): Promise<IDBPDatabase<DaycareDB>> {
  return openDB<DaycareDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create child store if it doesn't exist
      if (!db.objectStoreNames.contains('child')) {
        const childStore = db.createObjectStore('child', { keyPath: 'id', autoIncrement: true });
        childStore.createIndex('by-name', 'name');
      }

      // Create staff store if it doesn't exist
      if (!db.objectStoreNames.contains('staff')) {
        db.createObjectStore('staff', { keyPath: 'id', autoIncrement: true });
      }

      // Create locations store if it doesn't exist
      if (!db.objectStoreNames.contains('locations')) {
        const locationStore = db.createObjectStore('locations', {
          keyPath: 'id',
          autoIncrement: true,
        });
        locationStore.createIndex('by-branch', 'branchName', { unique: true });
      }

      // Create child schedules store if it doesn't exist
      if (!db.objectStoreNames.contains('childSchedules')) {
        const childSchedStore = db.createObjectStore('childSchedules', {
          keyPath: 'id',
          autoIncrement: true,
        });
        childSchedStore.createIndex('by-date-branch', ['date', 'branchId']);
      }

      // Create voucher transactions store if it doesn't exist
      if (!db.objectStoreNames.contains('voucherTransactions')) {
        const voucherTransactionsStore = db.createObjectStore('voucherTransactions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        voucherTransactionsStore.createIndex('by-child', 'childId');
        voucherTransactionsStore.createIndex('by-date', 'date');
      }

      // Create staff schedules store if it doesn't exist
      if (!db.objectStoreNames.contains('staffSchedules')) {
        const staffSchedStore = db.createObjectStore('staffSchedules', {
          keyPath: 'id',
          autoIncrement: true,
        });
        staffSchedStore.createIndex('by-date-branch', ['date', 'branchId']);
      }
    },
  });
}
