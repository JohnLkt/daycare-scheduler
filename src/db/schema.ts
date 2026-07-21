import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

export interface Parent {
  id?: number;
  name: string;
  childName: string;
  voucherType: 'daily' | 'voucher';
  remainingVouchers: number;
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

export interface ChildSchedule {
  id?: number;
  date: string; // YYYY-MM-DD
  branchId: number;
  parentId: number;
}

export interface StaffSchedule {
  id?: number;
  date: string; // YYYY-MM-DD
  branchId: number;
  staffId: number;
}

export interface DaycareDB extends DBSchema {
  parents: {
    key: number;
    value: Parent;
    indexes: { 'by-name': string };
  };
  staff: {
    key: number;
    value: Staff;
  };
  locations: {
    key: number;
    value: Location;
    indexes: { 'by-branch': string };
  };
  childSchedules: {
    key: number;
    value: ChildSchedule;
    indexes: { 'by-date-branch': [string, number] };
  };
  staffSchedules: {
    key: number;
    value: StaffSchedule;
    indexes: { 'by-date-branch': [string, number] };
  };
}

const DB_NAME = 'daycare-scheduler-db';
const DB_VERSION = 2;
export async function initDB(): Promise<IDBPDatabase<DaycareDB>> {
  return openDB<DaycareDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create parents store if it doesn't exist
      if (!db.objectStoreNames.contains('parents')) {
        const parentStore = db.createObjectStore('parents', { keyPath: 'id', autoIncrement: true });
        parentStore.createIndex('by-name', 'name');
      }

      // Create staff store if it doesn't exist
      if (!db.objectStoreNames.contains('staff')) {
        db.createObjectStore('staff', { keyPath: 'id', autoIncrement: true });
      }

      // Create locations store if it doesn't exist
      if (!db.objectStoreNames.contains('locations')) {
        const locationStore = db.createObjectStore('locations', { keyPath: 'id', autoIncrement: true });
        locationStore.createIndex('by-branch', 'branchName', { unique: true });
      }

      // Create child schedules store if it doesn't exist
      if (!db.objectStoreNames.contains('childSchedules')) {
        const childSchedStore = db.createObjectStore('childSchedules', { keyPath: 'id', autoIncrement: true });
        childSchedStore.createIndex('by-date-branch', ['date', 'branchId']);
      }

      // Create staff schedules store if it doesn't exist
      if (!db.objectStoreNames.contains('staffSchedules')) {
        const staffSchedStore = db.createObjectStore('staffSchedules', { keyPath: 'id', autoIncrement: true });
        staffSchedStore.createIndex('by-date-branch', ['date', 'branchId']);
      }
    },
  });
}