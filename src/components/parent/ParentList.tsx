import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Parent, Location } from '@/types/daycare';

interface ParentListProps {
  parents: Parent[];
  locations: Location[];
}

export const ParentList: React.FC<ParentListProps> = ({ parents, locations }) => {
  const getLocationName = (branchId: number) => {
    return locations.find((l) => l.id === branchId)?.branchName || `Branch #${branchId}`;
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Parent Registry</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {parents.map((p) => (
            <div key={p.id} className="py-3 flex justify-between items-start gap-4">
              <div className="space-y-1">
                <p className="font-semibold text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">Child: {p.childName}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {(p.branchIds || []).map((bId) => (
                    <Badge key={bId} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {getLocationName(bId)}
                    </Badge>
                  ))}
                  {(p.branchIds || []).length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No location assigned</span>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <Badge variant="outline" className="capitalize">
                  {p.voucherType}
                </Badge>
                {p.voucherType === 'voucher' && (
                  <p className="text-xs font-semibold text-primary mt-1">
                    {p.remainingVouchers} vouchers left
                  </p>
                )}
              </div>
            </div>
          ))}
          {parents.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">No parents registered yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};