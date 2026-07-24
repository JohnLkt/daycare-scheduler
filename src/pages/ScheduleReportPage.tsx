import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

import { useDaycareStore } from '@/store/DaycareStore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

import { Download } from 'lucide-react';
import { formatDisplayDate } from '@/lib/formatDisplayDate';

export default function ScheduleReportPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('all');
  const [selectedChildId, setSelectedChildId] = useState('all');

  const childSchedules = useDaycareStore((s) => s.childSchedules);
  const locations = useDaycareStore((s) => s.locations);
  const children = useDaycareStore((s) => s.children);

  const locationMap = useMemo(() => new Map(locations.map((loc) => [loc.id, loc])), [locations]);

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

  const rows = useMemo(() => {
    return childSchedules
      .filter((schedule) => {
        if (startDate && schedule.date < startDate) return false;
        if (endDate && schedule.date > endDate) return false;

        if (selectedLocationId !== 'all' && String(schedule.branchId) !== selectedLocationId) {
          return false;
        }

        if (selectedChildId !== 'all' && String(schedule.childId) !== selectedChildId) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((schedule) => {
        const child = childMap.get(schedule.childId);

        return {
          date: schedule.date,
          branch: locationMap.get(schedule.branchId)?.branchName ?? '-',
          child: child?.name ?? '-',
          voucher: child?.voucherType ?? '-',
          group: schedule.scheduleGroupId ?? '-',
        };
      });
  }, [
    childSchedules,
    startDate,
    endDate,
    selectedLocationId,
    selectedChildId,
    childMap,
    locationMap,
  ]);

  const exportExcel = () => {
    const sheet = XLSX.utils.aoa_to_sheet([
      ['Date', 'Branch', 'Child', 'Voucher', 'Group'],
      ...rows.map((row) => [row.date, row.branch, row.child, row.voucher, row.group]),
    ]);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, sheet, 'Schedules');

    XLSX.writeFile(workbook, 'schedule-report.xlsx');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Report</CardTitle>
        <CardDescription>
          Export scheduled children filtered by date, branch, and child.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters */}
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
              <ComboboxInput className="w-full" placeholder="Search child..." />

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

        {/* Actions */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {rows.length} schedule{rows.length !== 1 && 's'} found
          </p>

          <Button disabled={!rows.length} onClick={exportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden">
          {rows.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No schedules found.
            </div>
          ) : (
            <div className="max-h-[600px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Branch</th>
                    <th className="px-4 py-3 text-left">Child</th>
                    <th className="px-4 py-3 text-left">Voucher</th>
                    <th className="px-4 py-3 text-left">Group</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={`${row.date}-${row.child}-${index}`}
                      className="border-b last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-4 py-3">{formatDisplayDate(row.date)}</td>

                      <td className="px-4 py-3">{row.branch}</td>

                      <td className="px-4 py-3 font-medium">{row.child}</td>

                      <td className="px-4 py-3 capitalize">{row.voucher}</td>

                      <td className="px-4 py-3 text-muted-foreground">{row.group}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
