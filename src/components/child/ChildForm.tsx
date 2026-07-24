import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Child, Location } from '@/db/schema';

interface ChildFormProps {
  newChild: Child;
  locations: Location[];
  onChange: (child: Child) => void;
  onSubmit: (e: React.FormEvent) => void;
  editing?: boolean;
}

export const ChildForm: React.FC<ChildFormProps> = ({
  newChild,
  locations,
  onChange,
  onSubmit,
  editing = false,
}) => {
  const handleLocationToggle = (branchId: number) => {
    const currentBranchIds = newChild.branchIds ?? [];

    const updatedBranchIds = currentBranchIds.includes(branchId)
      ? currentBranchIds.filter((id) => id !== branchId)
      : [...currentBranchIds, branchId];

    onChange({ ...newChild, branchIds: updatedBranchIds });
  };

  const voucherOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Voucher', value: 'voucher' },
    { label: 'Weekend Voucher', value: 'weekend-voucher' },
  ];

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg font-bold">
          {editing ? 'Edit Child' : 'Add New Child'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="child-name">Child Name</Label>

            <Input
              id="child-name"
              required
              value={newChild.name}
              onChange={(e) => onChange({ ...newChild, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Bound Locations</Label>

            <div className="border rounded-md p-3 space-y-2 max-h-36 overflow-y-auto">
              {locations.length === 0 ? (
                <p className="text-xs text-muted-foreground">No branches available.</p>
              ) : (
                locations.map((location) => {
                  const id = location.id!;

                  return (
                    <div key={id} className="flex items-center gap-2">
                      <Checkbox
                        id={`branch-${id}`}
                        checked={newChild.branchIds.includes(id)}
                        onCheckedChange={() => handleLocationToggle(id)}
                      />

                      <Label htmlFor={`branch-${id}`} className="text-sm cursor-pointer">
                        {location.branchName}
                      </Label>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Voucher Type</Label>

            <Select
              value={newChild.voucherType}
              onValueChange={(value) =>
                onChange({ ...newChild, voucherType: value as Child['voucherType'] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {voucherOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={newChild.branchIds.length === 0}>
            {editing ? 'Update Child Record' : 'Create Child Record'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
