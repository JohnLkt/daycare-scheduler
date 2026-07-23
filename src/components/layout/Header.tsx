import React from 'react';
import { Calendar as CalendarIcon, Users, MapPin } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = [
    { path: '/schedule', label: 'Schedule', icon: CalendarIcon },
    { path: '/locations', label: 'Locations', icon: MapPin },
    { path: '/children', label: 'Children', icon: Users },
  ];

  return (
    <header className="border-b bg-background px-6 py-4 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <CalendarIcon className="h-6 w-6 text-primary" />
        <span>Daycare Operations Scheduler</span>
      </h1>
      <div className="flex gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex gap-1.5"
              variant={isActive ? 'default' : 'outline'}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>
    </header>
  );
};
