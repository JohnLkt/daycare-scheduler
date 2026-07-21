import { useState } from 'react';

import { LocationForm } from '@/components/location/LocationForm';
import { LocationList } from '@/components/location/LocationList';

import { useDaycareStore } from '@/store/DaycareStore';

import type { Location } from '@/db/schema';

export default function LocationsPage() {
  const {
    db,

    locations,

    refresh,
  } = useDaycareStore();

  const [newLocation, setNewLocation] = useState<Location>({ branchName: '', capacity: 10 });

  const addLocation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!db || !newLocation.branchName) {
      return;
    }

    await db.add('locations', newLocation);

    setNewLocation({ branchName: '', capacity: 10 });

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
      <LocationForm newLocation={newLocation} onChange={setNewLocation} onSubmit={addLocation} />

      <LocationList locations={locations} />
    </div>
  );
}
