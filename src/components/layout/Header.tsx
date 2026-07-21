import React from 'react';
import { Calendar as CalendarIcon, Users, UserCheck, MapPin } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ActiveTab } from '@/types/daycare';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="border-b bg-background px-6 py-4 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <CalendarIcon className="h-6 w-6 text-primary" />
        <span>Daycare Operations Scheduler</span>
      </h1>

      <Tabs value={activeTab} onValueChange={(val) => onTabChange(val as ActiveTab)}>
        <TabsList>
          <TabsTrigger value="calendar" className="gap-1.5">
            <CalendarIcon className="h-4 w-4" /> Schedule
          </TabsTrigger>
          <TabsTrigger value="parents" className="gap-1.5">
            <Users className="h-4 w-4" /> Parents
          </TabsTrigger>
          <TabsTrigger value="staff" className="gap-1.5">
            <UserCheck className="h-4 w-4" /> Staff
          </TabsTrigger>
          <TabsTrigger value="locations" className="gap-1.5">
            <MapPin className="h-4 w-4" /> Locations
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </header>
  );
};