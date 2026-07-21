import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Staff } from '@/types/daycare';

interface StaffListProps {
  staff: Staff[];
}

export const StaffList: React.FC<StaffListProps> = ({ staff }) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Staff Directory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {staff.map((s) => (
            <div key={s.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.number}</p>
              </div>
              <Badge variant="secondary">{s.role}</Badge>
            </div>
          ))}
          {staff.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No staff members registered yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
