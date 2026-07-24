import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import type { Child, ChildSchedule } from '@/types/daycare';

interface ChildrenScheduleCardProps {
  currentChildBookings: ChildSchedule[];
  children: Child[];
  selectedBranchId: number | null;
  selectedDate: string;
  selectedChildToSchedule: number | '';
  isFull: boolean;
  onSelectChild: (id: number) => void;
  onScheduleChild: () => void;
  onRemoveChild: (schedule: ChildSchedule) => void;
}

export const ChildrenScheduleCard: React.FC<ChildrenScheduleCardProps> = ({
  currentChildBookings,
  children,
  selectedBranchId,
  selectedDate,
  selectedChildToSchedule,
  isFull,
  onSelectChild,
  onScheduleChild,
  onRemoveChild,
}) => {
  const eligibleChildren = children.filter((child) => {
    if (selectedBranchId === null) {
      return false;
    }

    const selected = new Date(selectedDate);
    const dayOfWeek = selected.getDay();

    const isAssignedToBranch = (child.branchIds || []).includes(selectedBranchId);

    const isAlreadyScheduled = currentChildBookings.some(
      (schedule) => schedule.childId === child.id,
    );

    if (dayOfWeek === 0) {
      return false;
    }

    if (dayOfWeek === 6 && child.voucherType !== 'weekend-voucher') {
      return false;
    }

    if (dayOfWeek !== 6 && child.voucherType === 'weekend-voucher') {
      return false;
    }

    return isAssignedToBranch && !isAlreadyScheduled;
  });

  const childOptions = eligibleChildren.map((child) => ({
    label: child.name,
    value: String(child.id),
  }));

  const selectedChild =
    childOptions.find((child) => child.value === String(selectedChildToSchedule)) ?? null;

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold">Children Scheduled</CardTitle>

        <Badge variant="secondary">{currentChildBookings.length} total</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Combobox
              items={childOptions}
              value={selectedChild}
              onValueChange={(child) => {
                onSelectChild(Number(child?.value));
              }}
              itemToStringLabel={(item) => item.label}
              disabled={isFull || childOptions.length === 0}
            >
              <ComboboxInput
                placeholder={childOptions.length === 0 ? 'No available children' : 'Select child'}
                className="h-9 w-full"
              />

              <ComboboxContent>
                <ComboboxEmpty>No children found.</ComboboxEmpty>

                <ComboboxList>
                  {(option) => (
                    <ComboboxItem key={option.value} value={option}>
                      {option.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <Button
            disabled={isFull || !selectedChildToSchedule}
            onClick={onScheduleChild}
            size="sm"
            className="h-9 shrink-0 gap-1"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        <div className="divide-y divide-border">
          {currentChildBookings.map((schedule) => {
            const child = children.find((item) => item.id === schedule.childId);

            return (
              <div key={schedule.id} className="py-2.5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">{child?.name ?? 'Unknown Child'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {child?.voucherType}
                  </Badge>

                  <Button size="icon" variant="ghost" onClick={() => onRemoveChild(schedule)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}

          {currentChildBookings.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No children scheduled for this date.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
