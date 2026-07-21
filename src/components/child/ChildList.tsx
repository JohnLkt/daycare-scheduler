import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Child, Location, VoucherTransaction } from '@/types/daycare';

interface ChildListProps {
  children: Child[];
  locations: Location[];
  voucherTransactions: VoucherTransaction[];
}

export const ChildList: React.FC<ChildListProps> = ({
  children,
  locations,
  voucherTransactions,
}) => {
  const getLocationName = (branchId: number) => {
    return locations.find((l) => l.id === branchId)?.branchName || `Branch #${branchId}`;
  };

  const getVoucherBalance = (childId: number) => {
    return voucherTransactions
      .filter((transaction) => transaction.childId === childId)
      .reduce((balance, transaction) => {
        return transaction.type === 'topup'
          ? balance + transaction.amount
          : balance - transaction.amount;
      }, 0);
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Child Registry</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {children.map((c) => (
            <div key={c.id} className="py-3 flex justify-between items-start gap-4">
              <div className="space-y-1">
                <p className="font-semibold text-sm">{c.name}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {(c.branchIds || []).map((bId) => (
                    <Badge key={bId} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {getLocationName(bId)}
                    </Badge>
                  ))}
                  {(c.branchIds || []).length === 0 && (
                    <span className="text-xs text-muted-foreground italic">
                      No location assigned
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <Badge variant="outline" className="capitalize">
                  {c.voucherType}
                </Badge>
                {c.voucherType === 'voucher' && (
                  <p className="text-xs font-semibold text-primary mt-1">
                    {getVoucherBalance(c.id!)} vouchers left
                  </p>
                )}
              </div>
            </div>
          ))}
          {children.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No children registered yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
