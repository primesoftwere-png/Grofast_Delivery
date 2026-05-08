import { AppSidebar } from "./AppSidebar";
import { AppNavbar } from "./AppNavbar";

export function DashboardLayout({ children }) {
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

      </div>

    </div>
  );
}