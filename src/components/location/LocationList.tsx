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
import type { Location } from '@/types/daycare';

interface LocationListProps {
  locations: Location[];
  onEdit: (location: Location) => void;
  onDelete: (id: number) => void;
  editing?: boolean;
}

export const LocationList: React.FC<LocationListProps> = ({
  locations,
  onEdit,
  onDelete,
  editing = false,
}) => {
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  return (
    <>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Branches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {locations.map((loc) => (
              <div key={loc.id} className="py-3 flex justify-between items-center gap-4">
                <div>
                  <p className="font-semibold text-sm">{loc.branchName}</p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={editing}
                      onClick={() => onEdit(loc)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={editing}
                      onClick={() => setDeleteTarget(loc)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <Badge variant="outline">Capacity: {loc.capacity} Kids</Badge>
              </div>
            ))}
            {locations.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No locations registered yet.
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
            <AlertDialogTitle>Delete {deleteTarget?.branchName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will remove the branch and associated schedules.
              Child assignments will also be updated.
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
