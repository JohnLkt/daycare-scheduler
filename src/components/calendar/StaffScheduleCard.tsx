import React from 'react';

import { Plus, Trash2 } from 'lucide-react';

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

  onRemoveStaff: (scheduleId: number) => void;
}

export const StaffScheduleCard: React.FC<StaffScheduleCardProps> = ({
  currentStaffBookings,
  staff,
  selectedStaffToSchedule,
  onSelectStaff,
  onScheduleStaff,
  onRemoveStaff,
}) => {
  const scheduledStaffIds = currentStaffBookings.map((schedule) => schedule.staffId);

  const availableStaff = staff.filter((s) => !scheduledStaffIds.includes(s.id!));

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
              {availableStaff.map((s) => (
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
            <Plus className="h-4 w-4" />
            Assign
          </Button>
        </div>

        <div className="divide-y divide-border">
          {currentStaffBookings.map((schedule) => {
            const st = staff.find((s) => s.id === schedule.staffId);

            return (
              <div
                key={schedule.id}
                className="
                py-2.5
                flex
                justify-between
                items-center
                "
              >
                <div>
                  <p className="font-semibold text-sm">{st?.name ?? 'Unknown Staff'}</p>

                  <p className="text-xs text-muted-foreground">{st?.number}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{st?.role}</Badge>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive"
                    onClick={() => onRemoveStaff(schedule.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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
