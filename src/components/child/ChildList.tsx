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
import { PlusIcon } from 'lucide-react';
import type { Child, Location, VoucherTransaction } from '@/types/daycare';
import { VoucherLedgerModal } from './VoucherLedgerModal';

interface ChildListProps {
  children: Child[];
  locations: Location[];
  voucherTransactions: VoucherTransaction[];
  onEdit: (child: Child) => void;
  onDelete: (id: number) => void;
  onTopUp: (childId: number, amount: number, paymentDate: string, price: number) => void;
  editing?: boolean;
}

export const ChildList: React.FC<ChildListProps> = ({
  children,
  locations,
  voucherTransactions,
  onEdit,
  onDelete,
  onTopUp,
  editing = false,
}) => {
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null);
  const [ledgerTarget, setLedgerTarget] = useState<Child | null>(null);

  const [voucherAmount, setVoucherAmount] = useState(0);
  const [voucherPrice, setVoucherPrice] = useState(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

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

  const handleTopUp = () => {
    if (!ledgerTarget || voucherAmount <= 0) {
      return;
    }

    onTopUp(ledgerTarget.id!, voucherAmount, paymentDate, voucherPrice);

    setVoucherAmount(0);
    setVoucherPrice(0);
  };

  const closeLedger = () => {
    setLedgerTarget(null);
    setVoucherAmount(0);
    setVoucherPrice(0);
  };

  return (
    <>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Child Registry</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="divide-y divide-border">
            {children.map((child) => {
              const balance = getVoucherBalance(child.id!);

              return (
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

                    {(child.voucherType === 'voucher' ||
                      child.voucherType === 'weekend-voucher') && (
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <Button size="icon" variant="ghost" onClick={() => setLedgerTarget(child)}>
                          <PlusIcon className="h-4 w-4" />
                        </Button>

                        <span
                          className={`text-xs font-semibold ${
                            balance === 0 ? 'text-destructive' : 'text-primary'
                          }`}
                        >
                          {balance} vouchers
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
              This action cannot be undone. This will permanently delete the child record,
              schedules, and voucher history.
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

      <VoucherLedgerModal
        child={ledgerTarget}
        voucherTransactions={voucherTransactions}
        voucherAmount={voucherAmount}
        voucherPrice={voucherPrice}
        paymentDate={paymentDate}
        onVoucherAmountChange={setVoucherAmount}
        onVoucherPriceChange={setVoucherPrice}
        onPaymentDateChange={setPaymentDate}
        onTopUp={handleTopUp}
        onClose={closeLedger}
      />
    </>
  );
};
