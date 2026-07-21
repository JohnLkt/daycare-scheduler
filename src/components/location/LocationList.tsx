import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Location } from '@/types/daycare';

interface LocationListProps {
  locations: Location[];
}

export const LocationList: React.FC<LocationListProps> = ({ locations }) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Branches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {locations.map((loc) => (
            <div key={loc.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">{loc.branchName}</p>
              </div>
              <Badge variant="outline">Capacity: {loc.capacity} Kids</Badge>
            </div>
          ))}
          {locations.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No locations registered yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
