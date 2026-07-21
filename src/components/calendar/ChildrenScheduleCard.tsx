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
import type { Child, ChildSchedule } from '@/types/daycare';

interface ChildrenScheduleCardProps {
  currentChildBookings: ChildSchedule[];
  children: Child[];
  selectedBranchId: number | null;
  selectedChildToSchedule: number | '';
  isFull: boolean;
  onSelectChild: (id: number) => void;
  onScheduleChild: () => void;
}

export const ChildrenScheduleCard: React.FC<ChildrenScheduleCardProps> = ({
  currentChildBookings,
  children,
  selectedBranchId,
  selectedChildToSchedule,
  isFull,
  onSelectChild,
  onScheduleChild,
}) => {
  // Filter children bound to the currently active calendar branch
  const eligibleChildren = children.filter(
    (p) => selectedBranchId !== null && (p.branchIds || []).includes(selectedBranchId)
  );

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold">Children Scheduled</CardTitle>
        <Badge variant="secondary">{currentChildBookings.length} total</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select
            disabled={isFull || eligibleChildren.length === 0}
            value={selectedChildToSchedule ? String(selectedChildToSchedule) : ''}
            onValueChange={(val) => onSelectChild(Number(val))}
          >
            <SelectTrigger className="flex-1 h-9 text-sm">
              <SelectValue
                placeholder={
                  eligibleChildren.length === 0
                    ? 'No child assigned to this branch'
                    : 'Select Child'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {eligibleChildren.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            disabled={isFull || !selectedChildToSchedule}
            onClick={onScheduleChild}
            size="sm"
            className="gap-1"
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        <div className="divide-y divide-border">
          {currentChildBookings.map((cs) => {
            const child = children.find((p) => p.id === cs.childId);
            return (
              <div key={cs.id} className="py-2.5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">{child?.name}</p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {child?.voucherType}
                </Badge>
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
