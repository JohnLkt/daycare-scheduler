import React, { useState } from 'react';
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
  initialVoucherAmount: number;
  paymentDate: string;
  voucherBalance?: number;
  onInitialVoucherChange: (amount: number) => void;
  onPaymentDateChange: (date: string) => void;
  onTopUp?: (childId: number, amount: number, paymentDate: string) => void;
  onChange: (child: Child) => void;
  onSubmit: (e: React.FormEvent) => void;
  editing?: boolean;
}

export const ChildForm: React.FC<ChildFormProps> = ({
  newChild,
  locations,
  initialVoucherAmount,
  paymentDate,
  voucherBalance = 0,
  onInitialVoucherChange,
  onPaymentDateChange,
  onTopUp,
  onChange,
  onSubmit,
  editing = false,
}) => {
  const [topUpAmount, setTopUpAmount] = useState(0);
  const handleLocationToggle = (branchId: number) => {
    const currentBranchIds = newChild.branchIds ?? [];
    const updatedBranchIds = currentBranchIds.includes(branchId)
      ? currentBranchIds.filter((id) => id !== branchId)
      : [...currentBranchIds, branchId];
    onChange({ ...newChild, branchIds: updatedBranchIds });
  };
  const handleTopUp = () => {
    if (!newChild.id || !onTopUp || topUpAmount <= 0) {
      return;
    }
    onTopUp(newChild.id, topUpAmount, paymentDate);
    setTopUpAmount(0);
  };

  return (
    <Card>
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
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="voucher">Voucher</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {newChild.voucherType === 'voucher' && (
            <div className="space-y-3">
              {editing && (
                <div className="border rounded-md p-3">
                  <Label>Voucher Balance</Label>
                  <p className="text-lg font-bold text-primary">{voucherBalance} vouchers</p>
                </div>
              )}
              {!editing && (
                <div className="space-y-1.5">
                  <Label>Initial Voucher Purchase</Label>
                  <Input
                    type="number"
                    min="1"
                    value={initialVoucherAmount}
                    onChange={(e) => onInitialVoucherChange(Number(e.target.value))}
                  />
                </div>
              )}
              {editing && (
                <>
                  <div className="space-y-1.5">
                    <Label>Top Up Amount</Label>
                    <Input
                      type="number"
                      min="1"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Payment Date</Label>
                    <Input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => onPaymentDateChange(e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    disabled={topUpAmount <= 0}
                    onClick={handleTopUp}
                  >
                    Add Voucher Top Up
                  </Button>
                </>
              )}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={newChild.branchIds.length === 0}>
            {editing ? 'Update Child Record' : 'Create Child Record'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
