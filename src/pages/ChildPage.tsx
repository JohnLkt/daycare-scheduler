import { ChildForm } from '@/components/child/ChildForm';
import { ChildList } from '@/components/child/ChildList';
import { useDaycareStore } from '@/store/DaycareStore';
import type { Child } from '@/db/schema';
import { useState } from 'react';

export default function ChildPage() {
  const { db, children, locations, voucherTransactions, refresh } = useDaycareStore();

  const emptyChild: Child = { name: '', voucherType: 'daily', branchIds: [] };

  const [newChild, setNewChild] = useState(emptyChild);
  const [editingChildId, setEditingChildId] = useState<number | null>(null);

  const resetForm = () => {
    setNewChild(emptyChild);
    setEditingChildId(null);
  };

  const saveChild = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!db) {
      return;
    }

    if (editingChildId !== null) {
      await db.put('child', { ...newChild, id: editingChildId });

      resetForm();
      await refresh();
      return;
    }

    await db.add('child', newChild);

    resetForm();
    await refresh();
  };

  const editChild = (child: Child) => {
    setEditingChildId(child.id ?? null);
    setNewChild({ ...child });
  };

  const topUpVoucher = async (
    childId: number,
    amount: number,
    paymentDate: string,
    price: number,
  ) => {
    if (!db || amount <= 0) {
      return;
    }

    await db.add('voucherTransactions', {
      childId,
      amount,
      price,
      date: paymentDate,
      type: 'topup',
    });

    await refresh();
  };

  const deleteChild = async (id: number) => {
    if (!db) {
      return;
    }

    await db.delete('child', id);

    const schedules = await db.getAll('childSchedules');

    await Promise.all(
      schedules
        .filter((schedule) => schedule.childId === id)
        .map((schedule) => db.delete('childSchedules', schedule.id!)),
    );

    const transactions = await db.getAll('voucherTransactions');

    await Promise.all(
      transactions
        .filter((transaction) => transaction.childId === id)
        .map((transaction) => db.delete('voucherTransactions', transaction.id!)),
    );

    resetForm();
    await refresh();
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <ChildForm
        newChild={newChild}
        locations={locations}
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
        onTopUp={topUpVoucher}
        editing={editingChildId !== null}
      />
    </div>
  );
}
