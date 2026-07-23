import { useState } from 'react';
import { LocationForm } from '@/components/location/LocationForm';
import { LocationList } from '@/components/location/LocationList';
import { useDaycareStore } from '@/store/DaycareStore';
import type { Location } from '@/db/schema';

export default function LocationsPage() {
  const { db, locations, refresh } = useDaycareStore();

  const emptyLocation: Location = { branchName: '', capacity: 10 };
  const [newLocation, setNewLocation] = useState<Location>(emptyLocation);
  const [editingLocationId, setEditingLocationId] = useState<number | null>(null);

  const resetForm = () => {
    setNewLocation(emptyLocation);
    setEditingLocationId(null);
  };

  const saveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !newLocation.branchName) {
      return;
    }
    /**
     * Edit existing location
     */
    if (editingLocationId !== null) {
      await db.put('locations', { ...newLocation, id: editingLocationId });
      resetForm();
      await refresh();
      return;
    }
    /**
     * Create new location
     */
    await db.add('locations', newLocation);
    resetForm();
    await refresh();
  };

  const editLocation = (location: Location) => {
    setEditingLocationId(location.id ?? null);
    setNewLocation({ ...location });
  };

  const deleteLocation = async (id: number) => {
    if (!db) {
      return;
    }
    /**
     * Remove location
     */
    await db.delete('locations', id);
    /**
     * Cleanup child assignments
     */
    const children = await db.getAll('child');
    await Promise.all(
      children
        .filter((child) => child.branchIds.includes(id))
        .map((child) =>
          db.put('child', {
            ...child,
            branchIds: child.branchIds.filter((branchId) => branchId !== id),
          }),
        ),
    );
    /**
     * Cleanup schedules
     */
    const childSchedules = await db.getAll('childSchedules');
    await Promise.all(
      childSchedules
        .filter((schedule) => schedule.branchId === id)
        .map((schedule) => db.delete('childSchedules', schedule.id!)),
    );
    if (editingLocationId === id) {
      resetForm();
    }
    await refresh();
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <LocationForm
        newLocation={newLocation}
        onChange={setNewLocation}
        onSubmit={saveLocation}
        editing={editingLocationId !== null}
      />
      <LocationList
        locations={locations}
        onEdit={editLocation}
        onDelete={deleteLocation}
        editing={editingLocationId !== null}
      />
    </div>
  );
}
