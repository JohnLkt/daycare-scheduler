import { useState } from 'react';
import { ChildForm } from '@/components/child/ChildForm';
import { ChildList } from '@/components/child/ChildList';
import { useDaycareStore } from '@/store/DaycareStore';
import type { Child } from '@/db/schema';

export default function ChildrenPage() {
  const { db, children, locations, voucherTransactions, refresh } = useDaycareStore();

  const emptyChild: Child = { name: '', voucherType: 'daily', branchIds: [] };
  const [newChild, setNewChild] = useState<Child>(emptyChild);
  const [editingChildId, setEditingChildId] = useState<number | null>(null);
  const [initialVoucherAmount, setInitialVoucherAmount] = useState(0);
  const [voucherPaymentDate, setVoucherPaymentDate] = useState(
    new Date().toISOString().split('T')[0],
  );

  const resetForm = () => {
    setNewChild(emptyChild);
    setInitialVoucherAmount(0);
    setVoucherPaymentDate(new Date().toISOString().split('T')[0]);
    setEditingChildId(null);
  };

  const saveChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) {
      return;
    }
    /**
     * Update existing child
     */
    if (editingChildId !== null) {
      await db.put('child', { ...newChild, id: editingChildId });
      resetForm();
      await refresh();
      return;
    }
    /**
     * Create child
     */
    const childId = await db.add('child', newChild);
    /**
     * Initial voucher purchase
     */
    if (newChild.voucherType === 'voucher' && initialVoucherAmount > 0) {
      await db.add('voucherTransactions', {
        childId,
        amount: initialVoucherAmount,
        date: voucherPaymentDate,
        type: 'topup',
      });
    }
    resetForm();
    await refresh();
  };

  const editChild = (child: Child) => {
    setEditingChildId(child.id ?? null);
    setNewChild({ ...child });
    setInitialVoucherAmount(0);
    setVoucherPaymentDate(new Date().toISOString().split('T')[0]);
  };

  const deleteChild = async (id: number) => {
    if (!db) {
      return;
    }
    await db.delete('child', id);
    /**
     * Remove schedules
     */
    const schedules = await db.getAll('childSchedules');
    await Promise.all(
      schedules
        .filter((schedule) => schedule.childId === id)
        .map((schedule) => db.delete('childSchedules', schedule.id!)),
    );
    /**
     * Remove voucher ledger
     */
    const transactions = await db.getAll('voucherTransactions');
    await Promise.all(
      transactions
        .filter((transaction) => transaction.childId === id)
        .map((transaction) => db.delete('voucherTransactions', transaction.id!)),
    );
    if (editingChildId === id) {
      resetForm();
    }
    await refresh();
  };

  const topUpVoucher = async (childId: number, amount: number, paymentDate: string) => {
    if (!db || amount <= 0) {
      return;
    }
    await db.add('voucherTransactions', { childId, amount, date: paymentDate, type: 'topup' });
    await refresh();
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <ChildForm
        newChild={newChild}
        locations={locations}
        initialVoucherAmount={initialVoucherAmount}
        onInitialVoucherChange={setInitialVoucherAmount}
        paymentDate={voucherPaymentDate}
        onPaymentDateChange={setVoucherPaymentDate}
        voucherBalance={
          editingChildId
            ? voucherTransactions
                .filter((t) => t.childId === editingChildId)
                .reduce(
                  (balance, t) => (t.type === 'topup' ? balance + t.amount : balance - t.amount),
                  0,
                )
            : 0
        }
        onTopUp={topUpVoucher}
        onChange={setNewChild}
        onSubmit={saveChild}
        editing={editingChildId !== null}
      />
      <ChildList
        children={children}
        locations={locations}
        voucherTransactions={voucherTransactions}
        onEdit={editChild}
        onDelete={deleteChild}
        editing={editingChildId !== null}
      />
    </div>
  );
}
