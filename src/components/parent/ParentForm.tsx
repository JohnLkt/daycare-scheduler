import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Parent, Location } from '@/types/daycare';

interface ParentFormProps {
  newParent: Parent;
  locations: Location[];
  onChange: (parent: Parent) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ParentForm: React.FC<ParentFormProps> = ({ newParent, locations, onChange, onSubmit }) => {
  const handleLocationToggle = (branchId: number) => {
    const currentBranchIds = newParent.branchIds || [];
    const isSelected = currentBranchIds.includes(branchId);
    
    const updatedBranchIds = isSelected
      ? currentBranchIds.filter((id) => id !== branchId)
      : [...currentBranchIds, branchId];

    onChange({ ...newParent, branchIds: updatedBranchIds });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Add New Parent</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="parent-name">Parent Name</Label>
            <Input
              id="parent-name"
              required
              value={newParent.name}
              onChange={(e) => onChange({ ...newParent, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="child-name">Child Name</Label>
            <Input
              id="child-name"
              required
              value={newParent.childName}
              onChange={(e) => onChange({ ...newParent, childName: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Bound Locations (Select all that apply)</Label>
            <div className="border rounded-md p-3 space-y-2 max-h-36 overflow-y-auto bg-card">
              {locations.length === 0 ? (
                <p className="text-xs text-muted-foreground">No branches available. Add a branch first.</p>
              ) : (
                locations.map((loc) => {
                  const locId = loc.id!;
                  const isChecked = (newParent.branchIds || []).includes(locId);
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
              value={newParent.voucherType}
              onValueChange={(val) => onChange({ ...newParent, voucherType: val as 'daily' | 'voucher' })}
            >
              <SelectTrigger id="voucher-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Pass</SelectItem>
                <SelectItem value="voucher">Voucher Pack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newParent.voucherType === 'voucher' && (
            <div className="space-y-1.5">
              <Label htmlFor="voucher-amount">Initial Voucher Balance</Label>
              <Input
                id="voucher-amount"
                type="number"
                min="1"
                value={newParent.remainingVouchers}
                onChange={(e) => onChange({ ...newParent, remainingVouchers: Number(e.target.value) })}
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={(newParent.branchIds || []).length === 0}>
            Create Parent Record
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};