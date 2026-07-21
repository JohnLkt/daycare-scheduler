import { useState } from 'react';

import { ChildForm } from '@/components/child/ChildForm';
import { ChildList } from '@/components/child/ChildList';

import { useDaycareStore } from '@/store/DaycareStore';

import type { Child } from '@/db/schema';

export default function ChildrenPage() {
  const {
    db,

    children,
    locations,

    voucherTransactions,

    refresh,
  } = useDaycareStore();

  const [newChild, setNewChild] = useState<Child>({
    name: '',
    voucherType: 'daily',
    branchIds: [],
  });

  const [initialVoucherAmount, setInitialVoucherAmount] = useState(0);

  const addChild = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!db) {
      return;
    }

    const childId = await db.add('child', newChild);

    if (newChild.voucherType === 'voucher' && initialVoucherAmount > 0) {
      await db.add('voucherTransactions', {
        childId,

        date: new Date().toISOString().split('T')[0],

        type: 'topup',

        amount: initialVoucherAmount,
      });
    }

    // reset form
    setNewChild({ name: '', voucherType: 'daily', branchIds: [] });

    setInitialVoucherAmount(0);

    // update Zustand state
    await refresh();
  };

  return (
    <div
      className="
      grid
      md:grid-cols-3
      gap-6
      "
    >
      <ChildForm
        newChild={newChild}

        locations={locations}

        initialVoucherAmount={initialVoucherAmount}

        onInitialVoucherChange={setInitialVoucherAmount}

        onChange={setNewChild}

        onSubmit={addChild}
      />

      <ChildList
        children={children}

        locations={locations}

        voucherTransactions={voucherTransactions}
      />
    </div>
  );
}
