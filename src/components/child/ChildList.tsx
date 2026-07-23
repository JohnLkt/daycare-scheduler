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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { InfoIcon } from 'lucide-react';

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
  const [ledgerTarget, setLedgerTarget] = useState<{ child: Child } | null>(null);
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
              <div key={child.id} className="py-3 flex justify-between items-start gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{child.name}</p>
                    <div className="flex flex-wrap gap-1">
                      {(child.branchIds || []).map((branchId) => (
                        <Badge
                          key={branchId}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {getLocationName(branchId)}
                        </Badge>
                      ))}
                      {(child.branchIds || []).length === 0 && (
                        <span className="text-xs text-muted-foreground italic">
                          No location assigned
                        </span>
                      )}
                    </div>
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
                  {(child.voucherType === 'voucher' || child.voucherType === 'weekend-voucher') && (
                    <div className="flex items-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setLedgerTarget({ child })}
                      >
                        <InfoIcon className="h-1 w-1" />
                      </Button>
                      <p
                        className={`text-xs font-semibold text-primary mt-1
                        ${getVoucherBalance(child.id!) === 0 ? 'text-destructive' : ''}`}
                      >
                        {getVoucherBalance(child.id!)} vouchers left
                      </p>
                    </div>
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

      <Dialog
        open={ledgerTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setLedgerTarget(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Voucher History: <b>{ledgerTarget?.child.name}</b>
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="space-y-2">
            {(() => {
              const txns = voucherTransactions.filter((t) => t.childId === ledgerTarget?.child.id);
              if (txns.length === 0) return null;
              return (
                <div className="overflow-hidden rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                          Date
                        </th>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                          Type
                        </th>
                        <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {txns.map((txn) => (
                        <tr
                          key={txn.id}
                          className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-3 py-2 text-muted-foreground">{txn.date}</td>
                          <td className="px-3 py-2 capitalize">{txn.type}</td>
                          <td
                            className={`text-right px-3 py-2 font-medium ${txn.type === 'topup' ? 'text-primary' : 'text-destructive'}`}
                          >
                            {txn.type === 'topup' ? `+${txn.amount}` : `-${txn.amount}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};
