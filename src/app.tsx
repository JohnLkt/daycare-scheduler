import React, { useState, useEffect } from 'react';
import type { IDBPDatabase } from 'idb';
import { initDB } from './db/schema';
import type { DaycareDB, Parent, Staff, Location, ChildSchedule, StaffSchedule } from './db/schema';
import type { ActiveTab } from '@/types/daycare';

// Components
import { Header } from '@/components/layout/Header';
import { MonthCalendar } from '@/components/calendar/MonthCalendar';
import { ChildrenScheduleCard } from '@/components/calendar/ChildrenScheduleCard';
import { StaffScheduleCard } from '@/components/calendar/StaffScheduleCard';
import { ParentForm } from '@/components/parent/ParentForm';
import { ParentList } from '@/components/parent/ParentList';
import { StaffForm } from '@/components/staff/StaffForm';
import { StaffList } from '@/components/staff/StaffList';
import { LocationForm } from '@/components/location/LocationForm';
import { LocationList } from '@/components/location/LocationList';
import { Badge } from '@/components/ui/badge';

const formatDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [db, setDb] = useState<IDBPDatabase<DaycareDB> | null>(null);

  // Application State
  const [parents, setParents] = useState<Parent[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [childSchedules, setChildSchedules] = useState<ChildSchedule[]>([]);
  const [staffSchedules, setStaffSchedules] = useState<StaffSchedule[]>([]);

  // Month Calendar State
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(formatDateKey(new Date()));
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  // Forms State
  const [newParent, setNewParent] = useState<Parent>({ name: '', childName: '', voucherType: 'daily', remainingVouchers: 0, branchIds: [] });
  const [newStaff, setNewStaff] = useState<Staff>({ name: '', number: '', role: 'Teacher' });
  const [newLocation, setNewLocation] = useState<Location>({ branchName: '', capacity: 10 });
  const [selectedChildToSchedule, setSelectedChildToSchedule] = useState<number | ''>('');
  const [selectedStaffToSchedule, setSelectedStaffToSchedule] = useState<number | ''>('');

  const loadAllData = async (database: IDBPDatabase<DaycareDB>) => {
    const p = await database.getAll('parents');
    const s = await database.getAll('staff');
    const l = await database.getAll('locations');
    const cs = await database.getAll('childSchedules');
    const ss = await database.getAll('staffSchedules');

    setParents(p);
    setStaff(s);
    setLocations(l);
    setChildSchedules(cs);
    setStaffSchedules(ss);

    if (l.length > 0 && selectedBranchId === null && l[0].id !== undefined) {
      setSelectedBranchId(l[0].id);
    }
  };

  useEffect(() => {
    initDB().then((database) => {
      setDb(database);
      loadAllData(database);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !newParent.name || !newParent.childName) return;
    await db.add('parents', newParent);
    setNewParent({ name: '', childName: '', voucherType: 'daily', remainingVouchers: 0, branchIds: [] });
    loadAllData(db);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !newStaff.name) return;
    await db.add('staff', newStaff);
    setNewStaff({ name: '', number: '', role: 'Teacher' });
    loadAllData(db);
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !newLocation.branchName) return;
    const id = await db.add('locations', newLocation);
    if (selectedBranchId === null) setSelectedBranchId(id);
    setNewLocation({ branchName: '', capacity: 10 });
    loadAllData(db);
  };

  const handleScheduleChild = async () => {
    if (!db || !selectedBranchId || !selectedChildToSchedule) return;

    const currentLocation = locations.find((l) => l.id === Number(selectedBranchId));
    const currentBookings = childSchedules.filter(
      (cs) => cs.date === selectedDate && cs.branchId === Number(selectedBranchId)
    );

    if (currentLocation && currentBookings.length >= currentLocation.capacity) {
      alert('Capacity reached for this branch on the selected date!');
      return;
    }

    const parent = parents.find((p) => p.id === Number(selectedChildToSchedule));
    if (parent?.voucherType === 'voucher') {
      if (parent.remainingVouchers <= 0) {
        alert('Parent has no remaining vouchers!');
        return;
      }
      await db.put('parents', { ...parent, remainingVouchers: parent.remainingVouchers - 1 });
    }

    await db.add('childSchedules', {
      date: selectedDate,
      branchId: Number(selectedBranchId),
      parentId: Number(selectedChildToSchedule),
    });

    setSelectedChildToSchedule('');
    loadAllData(db);
  };

  const handleScheduleStaff = async () => {
    if (!db || !selectedBranchId || !selectedStaffToSchedule) return;

    await db.add('staffSchedules', {
      date: selectedDate,
      branchId: Number(selectedBranchId),
      staffId: Number(selectedStaffToSchedule),
    });

    setSelectedStaffToSchedule('');
    loadAllData(db);
  };

  const activeBranch = locations.find((l) => l.id === Number(selectedBranchId));
  const currentChildBookings = childSchedules.filter(
    (cs) => cs.date === selectedDate && cs.branchId === Number(selectedBranchId)
  );
  const currentStaffBookings = staffSchedules.filter(
    (ss) => ss.date === selectedDate && ss.branchId === Number(selectedBranchId)
  );
  const isFull = activeBranch ? currentChildBookings.length >= activeBranch.capacity : false;

  const generateMonthDays = (year: number, month: number) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: Array<{ date: Date; isCurrentMonth: boolean; dateStr: string }> = [];

    for (let i = startDayOfWeek; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i);
      days.push({ date: prevDate, isCurrentMonth: false, dateStr: formatDateKey(prevDate) });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const currDate = new Date(year, month, i);
      days.push({ date: currDate, isCurrentMonth: true, dateStr: formatDateKey(currDate) });
    }

    const totalSlots = Math.ceil(days.length / 7) * 7;
    const remainingSlots = totalSlots - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false, dateStr: formatDateKey(nextDate) });
    }

    return days;
  };

  const calendarDays = generateMonthDays(currentMonth.getFullYear(), currentMonth.getMonth());

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
        {activeTab === 'calendar' && (
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
              onPrevMonth={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              onNextMonth={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              onSelectDate={setSelectedDate}
              onSelectBranch={setSelectedBranchId}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  Details for <span className="text-primary">{selectedDate}</span>
                </h3>
                {activeBranch && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-medium">Daily Capacity:</span>
                    <Badge variant={isFull ? 'destructive' : 'secondary'} className="text-xs">
                      {currentChildBookings.length} / {activeBranch.capacity} Kids
                    </Badge>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <ChildrenScheduleCard
                  currentChildBookings={currentChildBookings}
                  parents={parents}
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
        )}

        {activeTab === 'parents' && (
          <div className="grid md:grid-cols-3 gap-6">
            <ParentForm newParent={newParent} onChange={setNewParent} onSubmit={handleAddParent} locations={locations} />
            <ParentList parents={parents} locations={locations} />
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="grid md:grid-cols-3 gap-6">
            <StaffForm newStaff={newStaff} onChange={setNewStaff} onSubmit={handleAddStaff} />
            <StaffList staff={staff} />
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="grid md:grid-cols-3 gap-6">
            <LocationForm newLocation={newLocation} onChange={setNewLocation} onSubmit={handleAddLocation} />
            <LocationList locations={locations} />
          </div>
        )}
      </main>
    </div>
  );
}