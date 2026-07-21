import { useState } from 'react';

import { StaffForm } from '@/components/staff/StaffForm';
import { StaffList } from '@/components/staff/StaffList';

import { useDaycareStore } from '@/store/DaycareStore';

import type { Staff } from '@/db/schema';

export default function StaffPage() {
  const { db, staff, refresh } = useDaycareStore();

  const emptyStaff: Staff = { name: '', number: '', role: 'Teacher' };

  const [newStaff, setNewStaff] = useState<Staff>(emptyStaff);

  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);

  const resetForm = () => {
    setNewStaff(emptyStaff);

    setEditingStaffId(null);
  };

  const saveStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!db || !newStaff.name) {
      return;
    }

    /**
     * Edit existing staff
     */
    if (editingStaffId !== null) {
      await db.put('staff', { ...newStaff, id: editingStaffId });

      resetForm();

      await refresh();

      return;
    }

    /**
     * Create new staff
     */
    await db.add('staff', newStaff);

    resetForm();

    await refresh();
  };

  const editStaff = (staffMember: Staff) => {
    setEditingStaffId(staffMember.id ?? null);

    setNewStaff({ ...staffMember });
  };

  const deleteStaff = async (id: number) => {
    if (!db) {
      return;
    }

    await db.delete('staff', id);

    /**
     * Remove related staff schedules
     */
    const schedules = await db.getAll('staffSchedules');

    await Promise.all(
      schedules
        .filter((schedule) => schedule.staffId === id)
        .map((schedule) => db.delete('staffSchedules', schedule.id!)),
    );

    if (editingStaffId === id) {
      resetForm();
    }

    await refresh();
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <StaffForm
        newStaff={newStaff}
        onChange={setNewStaff}
        onSubmit={saveStaff}
        editing={editingStaffId !== null}
      />

      <StaffList
        staff={staff}
        onEdit={editStaff}
        onDelete={deleteStaff}
        editing={editingStaffId !== null}
      />
    </div>
  );
}
