import { useState } from 'react';

import { StaffForm } from '@/components/staff/StaffForm';
import { StaffList } from '@/components/staff/StaffList';

import { useDaycareStore } from '@/store/DaycareStore';

import type { Staff } from '@/db/schema';

export default function StaffPage() {
  const { db, staff, refresh } = useDaycareStore();

  const [newStaff, setNewStaff] = useState<Staff>({ name: '', number: '', role: 'Teacher' });

  const addStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!db || !newStaff.name) {
      return;
    }

    await db.add('staff', newStaff);

    setNewStaff({ name: '', number: '', role: 'Teacher' });

    await refresh();
  };

  return (
    <div
      className="
      grid
      md:grid-cols-3
      gap-6
      "
    >
      <StaffForm newStaff={newStaff} onChange={setNewStaff} onSubmit={addStaff} />

      <StaffList staff={staff} />
    </div>
  );
}
