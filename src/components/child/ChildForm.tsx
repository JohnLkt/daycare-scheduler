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
import type { Child, Location } from '@/types/daycare';

interface ChildFormProps {
  newChild: Child;
  locations: Location[];
  initialVoucherAmount: number;
  onInitialVoucherChange: (amount: number) => void;
  onChange: (child: Child) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ChildForm: React.FC<ChildFormProps> = ({
  newChild,
  locations,
  initialVoucherAmount,
  onInitialVoucherChange,
  onChange,
  onSubmit,
}) => {
  const handleLocationToggle = (branchId: number) => {
    const currentBranchIds = newChild.branchIds || [];
    const isSelected = currentBranchIds.includes(branchId);

    const updatedBranchIds = isSelected
      ? currentBranchIds.filter((id) => id !== branchId)
      : [...currentBranchIds, branchId];

    onChange({ ...newChild, branchIds: updatedBranchIds });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Add New Child</CardTitle>
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
            <Label>Bound Locations (Select all that apply)</Label>
            <div className="border rounded-md p-3 space-y-2 max-h-36 overflow-y-auto bg-card">
              {locations.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No branches available. Add a branch first.
                </p>
              ) : (
                locations.map((loc) => {
                  const locId = loc.id!;
                  const isChecked = (newChild.branchIds || []).includes(locId);
                  return (
                    <div key={locId} className="flex items-center space-x-2">
                      <Checkbox
                        id={`branch-${locId}`}
                        checked={isChecked}
                        onCheckedChange={() => handleLocationToggle(locId)}
                      />
                      <Label
                        htmlFor={`branch-${locId}`}
                        className="text-sm font-normal cursor-pointer leading-none"
                      >
                        {loc.branchName}
                      </Label>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="voucher-type">Voucher Type</Label>
            <Select
              value={newChild.voucherType}
              onValueChange={(val) =>
                onChange({ ...newChild, voucherType: val as 'daily' | 'voucher' })
              }
            >
              <SelectTrigger id="voucher-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="voucher">Voucher</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newChild.voucherType === 'voucher' && (
            <div className="space-y-1.5">
              <Label htmlFor="initial-voucher">Initial Voucher Purchase</Label>

              <Input
                id="initial-voucher"
                type="number"
                min="1"
                value={initialVoucherAmount}
                onChange={(e) => onInitialVoucherChange(Number(e.target.value))}
              />

              <p className="text-xs text-muted-foreground">
                This will create an initial voucher top-up transaction.
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={(newChild.branchIds || []).length === 0}
          >
            Create Child Record
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
