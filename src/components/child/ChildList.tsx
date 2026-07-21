import React, { useState } from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import type { Child, Location, VoucherTransaction } from '@/types/daycare';

interface ChildListProps {
  children: Child[];

  locations: Location[];

  voucherTransactions: VoucherTransaction[];

  onEdit: (child: Child) => void;

  onDelete: (id: number) => void;

  editing?: boolean;
}

export const ChildList: React.FC<ChildListProps> = ({
  children,
  locations,
  voucherTransactions,
  onEdit,
  onDelete,
  editing = false,
}) => {
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null);

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
    <>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Child Registry</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="divide-y divide-border">
            {children.map((child) => (
              <div
                key={child.id}
                className="
                py-3
                flex
                justify-between
                items-start
                gap-4
                "
              >
                <div className="space-y-2">
                  <p className="font-semibold text-sm">{child.name}</p>

                  <div className="flex flex-wrap gap-1">
                    {(child.branchIds || []).map((branchId) => (
                      <Badge key={branchId} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {getLocationName(branchId)}
                      </Badge>
                    ))}

                    {(child.branchIds || []).length === 0 && (
                      <span className="text-xs text-muted-foreground italic">
                        No location assigned
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={editing}
                      onClick={() => onEdit(child)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={editing}
                      onClick={() => setDeleteTarget(child)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <Badge variant="outline" className="capitalize">
                    {child.voucherType}
                  </Badge>

                  {child.voucherType === 'voucher' && (
                    <p className="text-xs font-semibold text-primary mt-1">
                      {getVoucherBalance(child.id!)} vouchers left
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

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the child record, schedule
              history, and voucher transaction history.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={() => {
                if (deleteTarget?.id) {
                  onDelete(deleteTarget.id);
                }

                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
