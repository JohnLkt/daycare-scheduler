import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import DashboardLayout from '@/layouts/DashboardLayout';

import CalendarPage from '@/pages/CalendarPage';
import ChildrenPage from '@/pages/ChildPage';
import StaffPage from '@/pages/StaffPage';
import LocationPage from '@/pages/LocationPage';

import { Toaster } from '@/components/ui/sonner';

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/schedule" />} />

            <Route path="schedule" element={<CalendarPage />} />

            <Route path="locations" element={<LocationPage />} />

            <Route path="children" element={<ChildrenPage />} />

            <Route path="staff" element={<StaffPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}
