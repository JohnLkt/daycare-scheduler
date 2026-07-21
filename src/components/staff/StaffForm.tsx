import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Staff } from '@/types/daycare';

interface StaffFormProps {
  newStaff: Staff;
  onChange: (staff: Staff) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const StaffForm: React.FC<StaffFormProps> = ({ newStaff, onChange, onSubmit }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Add Staff Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="staff-name">Full Name</Label>
            <Input
              id="staff-name"
              required
              value={newStaff.name}
              onChange={(e) => onChange({ ...newStaff, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-number">Contact Number</Label>
            <Input
              id="staff-number"
              required
              value={newStaff.number}
              onChange={(e) => onChange({ ...newStaff, number: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-role">Role</Label>
            <Select
              value={newStaff.role}
              onValueChange={(val) => onChange({ ...newStaff, role: val as Staff['role'] })}
            >
              <SelectTrigger id="staff-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Teacher">Teacher</SelectItem>
                <SelectItem value="Caregiver">Caregiver</SelectItem>
                <SelectItem value="Assistant">Assistant</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Save Staff
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
