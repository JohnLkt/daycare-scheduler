import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { RupiahInput } from '@/components/inputs/RupiahInput';
import { formatRupiah } from '@/lib/formatRupiah';
import type { Child, VoucherTransaction } from '@/types/daycare';

interface VoucherLedgerModalProps {
  child: Child | null;
  voucherTransactions: VoucherTransaction[];
  voucherAmount: number;
  voucherPrice: number;
  paymentDate: string;
  onVoucherAmountChange: (amount: number) => void;
  onVoucherPriceChange: (price: number) => void;
  onPaymentDateChange: (date: string) => void;
  onTopUp: (childId: number, amount: number, date: string, price: number) => void;
  onClose: () => void;
}

export const VoucherLedgerModal: React.FC<VoucherLedgerModalProps> = ({
  child,
  voucherTransactions,
  voucherAmount,
  voucherPrice,
  paymentDate,
  onVoucherAmountChange,
  onVoucherPriceChange,
  onPaymentDateChange,
  onTopUp,
  onClose,
}) => {
  const open = child !== null;

  const balance = child
    ? voucherTransactions
        .filter((transaction) => transaction.childId === child.id)
        .reduce(
          (total, transaction) =>
            transaction.type === 'topup' ? total + transaction.amount : total - transaction.amount,
          0,
        )
    : 0;

  const transactions = child
    ? voucherTransactions.filter((transaction) => transaction.childId === child.id)
    : [];

  const handleTopUp = () => {
    if (!child?.id || voucherAmount <= 0) {
      return;
    }

    onTopUp(child.id, voucherAmount, paymentDate, voucherPrice);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Voucher History: <b>{child?.name}</b>
          </DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="space-y-4">
          <div className="border rounded-md p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Label>Add Voucher</Label>

              <span className="text-sm font-semibold text-primary">Balance: {balance}</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Amount</Label>
                <Input
                  type="number"
                  min="1"
                  value={voucherAmount}
                  onChange={(e) => onVoucherAmountChange(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Price (Rp)</Label>
                <RupiahInput value={voucherPrice} onChange={onVoucherPriceChange} />
              </div>

              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => onPaymentDateChange(e.target.value)}
                />
              </div>
            </div>

            <Button className="w-full" disabled={voucherAmount <= 0} onClick={handleTopUp}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Voucher
            </Button>
          </div>

          <Separator />

          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No voucher transactions.
            </p>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">Type</th>
                    <th className="text-right px-3 py-2">Amount</th>
                    <th className="text-right px-3 py-2">Price</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b last:border-b-0">
                      <td className="px-3 py-2">{transaction.date}</td>

                      <td className="px-3 py-2 capitalize">{transaction.type}</td>

                      <td
                        className={`text-right px-3 py-2 ${
                          transaction.type === 'topup' ? 'text-primary' : 'text-destructive'
                        }`}
                      >
                        {transaction.type === 'topup'
                          ? `+${transaction.amount}`
                          : `-${transaction.amount}`}
                      </td>

                      <td className="text-right px-3 py-2">
                        {transaction.price !== undefined ? formatRupiah(transaction.price) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
