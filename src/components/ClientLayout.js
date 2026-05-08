'use client';

import { usePathname } from 'next/navigation';
import { AppNavbar } from "@/components/AppNavbar";
import { AppSidebar } from "@/components/AppSidebar";
import DeliveryRequestNotification from "@/components/DeliveryRequestNotification";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  
  // Pages where sidebar and navbar should be hidden (auth pages and standalone pages)
  const pagesWithoutLayout = ['/', '/login', '/register', '/verify-email', '/api-test'];
  const isPageWithoutLayout = pagesWithoutLayout.includes(pathname);

  // If it's a page without layout, render without sidebar and navbar
  if (isPageWithoutLayout) {
    return (
      <div className="min-h-screen w-full">
        {children}
      </div>
    );
  }

  // Regular layout with sidebar and navbar for dashboard pages
  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <AppNavbar />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>

        {/* Delivery Request Notifications */}
        <DeliveryRequestNotification />
      </div>
    </div>
  );
}
