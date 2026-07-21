import React from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Staff, StaffSchedule } from '@/db/schema';

interface StaffScheduleCardProps {
  currentStaffBookings: StaffSchedule[];
  staff: Staff[];
  selectedStaffToSchedule: number | '';
  onSelectStaff: (id: number) => void;
  onScheduleStaff: () => void;
}

export const StaffScheduleCard: React.FC<StaffScheduleCardProps> = ({
  currentStaffBookings,
  staff,
  selectedStaffToSchedule,
  onSelectStaff,
  onScheduleStaff,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold">Staff On Duty</CardTitle>
        <Badge variant="secondary">{currentStaffBookings.length} assigned</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select
            value={selectedStaffToSchedule ? String(selectedStaffToSchedule) : ''}
            onValueChange={(val) => onSelectStaff(Number(val))}
          >
            <SelectTrigger className="flex-1 h-9 text-sm">
              <SelectValue placeholder="Select Staff Member" />
            </SelectTrigger>
            <SelectContent>
              {staff.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name} ({s.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            disabled={!selectedStaffToSchedule}
            onClick={onScheduleStaff}
            size="sm"
            className="gap-1"
          >
            <Plus className="h-4 w-4" /> Assign
          </Button>
        </div>

        <div className="divide-y divide-border">
          {currentStaffBookings.map((ss) => {
            const st = staff.find((s) => s.id === ss.staffId);
            return (
              <div key={ss.id} className="py-2.5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">{st?.name}</p>
                  <p className="text-xs text-muted-foreground">{st?.number}</p>
                </div>
                <Badge variant="secondary">{st?.role}</Badge>
              </div>
            );
          })}
          {currentStaffBookings.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No staff assigned for this date.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
