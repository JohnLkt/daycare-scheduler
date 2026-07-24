import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

import { useDaycareStore } from '@/store/DaycareStore';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Download } from 'lucide-react';
import { formatDisplayDate } from '@/lib/formatDisplayDate';
import { formatRupiah } from '@/lib/formatRupiah';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

export default function VoucherReportingPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('all');
  const [selectedChildId, setSelectedChildId] = useState('all');

  const voucherTransactions = useDaycareStore((s) => s.voucherTransactions);
  const children = useDaycareStore((s) => s.children);
  const locations = useDaycareStore((s) => s.locations);

  const childMap = useMemo(() => new Map(children.map((child) => [child.id, child])), [children]);

  const childOptions = useMemo(
    () => [
      { label: 'All Children', value: 'all' },
      ...children.map((child) => ({ label: child.name, value: String(child.id) })),
    ],
    [children],
  );

  const selectedChildOption =
    childOptions.find((option) => option.value === selectedChildId) ?? childOptions[0];

  const locationMap = useMemo(
    () => new Map(locations.map((location) => [location.id, location])),
    [locations],
  );

  const filteredTransactions = useMemo(() => {
    return voucherTransactions
      .filter((transaction) => {
        const child = childMap.get(transaction.childId);

        if (startDate && transaction.date < startDate) {
          return false;
        }

        if (endDate && transaction.date > endDate) {
          return false;
        }

        if (selectedChildId !== 'all' && String(transaction.childId) !== selectedChildId) {
          return false;
        }

        if (
          selectedLocationId !== 'all' &&
          child &&
          !child.branchIds.includes(Number(selectedLocationId))
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [voucherTransactions, childMap, startDate, endDate, selectedChildId, selectedLocationId]);

  const summary = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'topup') {
          acc.topup += transaction.amount;
          acc.payment += transaction.price ?? 0;
        } else {
          acc.usage += transaction.amount;
        }

        return acc;
      },
      { topup: 0, usage: 0, payment: 0 },
    );
  }, [filteredTransactions]);

  const handleExport = () => {
    const data = [
      ['Date', 'Child', 'Branch', 'Type', 'Amount', 'Price'],

      ...filteredTransactions.map((transaction) => {
        const child = childMap.get(transaction.childId);

        return [
          transaction.date,
          child?.name ?? '-',
          child?.branchIds.map((id) => locationMap.get(id)?.branchName).join(', ') ?? '-',
          transaction.type,
          transaction.amount,
          transaction.price ?? '-',
        ];
      }),
    ];

    const sheet = XLSX.utils.aoa_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, sheet, 'Voucher Transactions');

    const blob = new Blob([XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = `voucher-report-${startDate || 'all'}.xlsx`;

    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Voucher Report</CardTitle>

          <CardDescription>Track voucher top ups and usage history.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                className="w-full"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                className="w-full"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Branch</Label>
              <Select
                value={selectedLocationId}
                onValueChange={(value) => setSelectedLocationId(value ?? 'all')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>

                  {locations.map((location) => (
                    <SelectItem key={location.id} value={String(location.id)}>
                      {location.branchName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Child</Label>

              <Combobox
                items={childOptions}
                value={selectedChildOption}
                onValueChange={(option) => {
                  setSelectedChildId(option?.value ?? 'all');
                }}
                itemToStringLabel={(option) => option.label}
              >
                <ComboboxInput placeholder="Search child..." className="w-full" />

                <ComboboxContent>
                  <ComboboxEmpty>No children found.</ComboboxEmpty>

                  <ComboboxList>
                    {(option) => (
                      <ComboboxItem key={option.value} value={option}>
                        {option.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent>
                <p className="text-sm text-muted-foreground">Total Top Up</p>
                <p className="text-2xl font-bold">{summary.topup}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <p className="text-sm text-muted-foreground">Total Used</p>
                <p className="text-2xl font-bold">{summary.usage}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <p className="text-sm text-muted-foreground">Payment Received</p>
                <p className="text-2xl font-bold">{formatRupiah(summary.payment)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {filteredTransactions.length} transaction(s)
            </p>

            <Button disabled={!filteredTransactions.length} onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Child</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Price</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((transaction) => {
                  const child = childMap.get(transaction.childId);

                  return (
                    <tr key={transaction.id} className="border-b last:border-0">
                      <td className="px-4 py-3">{formatDisplayDate(transaction.date)}</td>

                      <td className="px-4 py-3 font-medium">{child?.name ?? '-'}</td>

                      <td className="px-4 py-3 capitalize">{transaction.type}</td>

                      <td className="px-4 py-3 text-right">
                        {transaction.type === 'topup'
                          ? `+${transaction.amount}`
                          : `-${transaction.amount}`}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {transaction.price ? formatRupiah(transaction.price) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
