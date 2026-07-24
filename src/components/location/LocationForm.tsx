import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { Location } from '@/types/daycare';

interface LocationFormProps {
  newLocation: Location;
  onChange: (location: Location) => void;
  onSubmit: (e: React.FormEvent) => void;
  editing?: boolean;
}

export const LocationForm: React.FC<LocationFormProps> = ({
  newLocation,
  onChange,
  onSubmit,
  editing = false,
}) => {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg font-bold">
          {editing ? 'Edit Daycare Branch' : 'Add Daycare Branch'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="branch-name">Branch Name</Label>
            <Input
              id="branch-name"
              required
              value={newLocation.branchName}
              onChange={(e) => onChange({ ...newLocation, branchName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="branch-capacity">Max Daily Capacity</Label>
            <Input
              id="branch-capacity"
              type="number"
              min="1"
              required
              value={newLocation.capacity}
              onChange={(e) => onChange({ ...newLocation, capacity: Number(e.target.value) })}
            />
          </div>
          <Button type="submit" className="w-full">
            {editing ? 'Update Location' : 'Create Location'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
