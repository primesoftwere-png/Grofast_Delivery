'use client';

import {
  LayoutDashboard,
  Map,
  Package,
  DollarSign,
  MessageCircle,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Manage Map", url: "/manage-map", icon: Map },
  { title: "Orders Summary", url: "/orders-summary", icon: Package },
  { title: "Income", url: "/income", icon: DollarSign },
  { title: "Wallet", url: "/wallet", icon: DollarSign },
  { title: "Chat", url: "/chat", icon: MessageCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const router = useRouter();

  // collapsed logic removed (manual simple sidebar)
  const collapsed = false;

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 h-[100dvh] md:h-screen md:min-h-screen border-r border-sidebar-border flex flex-col bg-card transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

      {/* Header */}
      {!collapsed && (
        <div className="px-4 pb-4 pt-4 mb-2 border-b border-sidebar-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-primary">
              GroFastdv
            </h2>
            <p className="text-xs text-muted-foreground">
              Delivery Partner
            </p>
          </div>
          <button 
            className="md:hidden text-muted-foreground hover:text-foreground p-2 text-xl"
            onClick={() => setIsOpen && setIsOpen(false)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Menu */}
      <div className="flex-1 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.url;

          return (
            <button
              key={item.title}
              onClick={() => {
                router.push(item.url);
                if (setIsOpen) setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => {
            router.push("/login");
            if (setIsOpen) setIsOpen(false);
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

    </div>
  );
}