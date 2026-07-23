import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useDaycareStore } from '@/store/DaycareStore';

export default function DashboardLayout() {
  const initialize = useDaycareStore((state) => state.initialize);
  const loading = useDaycareStore((state) => state.loading);
  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div
        className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-background
        text-foreground
        "
      >
        <p className="text-sm text-muted-foreground">Loading daycare data...</p>
      </div>
    );
  }

  return (
    <div
      className="
      min-h-screen
      bg-background
      text-foreground
      flex
      flex-col
      "
    >
      <Header />
      <main
        className="
        flex-1
        p-6
        max-w-6xl
        w-full
        mx-auto
        "
      >
        <Outlet />
      </main>
    </div>
  );
}
