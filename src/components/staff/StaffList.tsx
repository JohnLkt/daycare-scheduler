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

import type { Staff } from '@/types/daycare';

interface StaffListProps {
  staff: Staff[];

  onEdit: (staff: Staff) => void;

  onDelete: (id: number) => void;

  editing?: boolean;
}

export const StaffList: React.FC<StaffListProps> = ({
  staff,
  onEdit,
  onDelete,
  editing = false,
}) => {
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);

  return (
    <>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Staff Directory</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="divide-y divide-border">
            {staff.map((member) => (
              <div
                key={member.id}
                className="
                py-3
                flex
                justify-between
                items-center
                gap-4
                "
              >
                <div>
                  <p className="font-semibold text-sm">{member.name}</p>

                  <p className="text-xs text-muted-foreground">{member.number}</p>

                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={editing}
                      onClick={() => onEdit(member)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={editing}
                      onClick={() => setDeleteTarget(member)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <Badge variant="secondary">{member.role}</Badge>
              </div>
            ))}

            {staff.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No staff members registered yet.
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
              This action cannot be undone. This will permanently delete this staff member and
              remove their assigned schedules.
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
