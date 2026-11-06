
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import {
  ChartNoAxesCombined,
  LayoutDashboard,
  MessageSquare,
  Package,
  ShoppingCart,
  Ticket,
  Users,
  FileText,
  Settings,
  HelpCircle,
  Droplets,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const menuItems = [
  { name: "Analytics", icon: ChartNoAxesCombined, href: "/analytics" },
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "AI Assistant", icon: MessageSquare, href: "/assistant" },
  { name: "Products", icon: Package, href: "/products" },
  { name: "Orders", icon: ShoppingCart, href: "/orders" },
  { name: "Customer Tickets", icon: Ticket, href: "/tickets" },
  { name: "Customers", icon: Users, href: "/customers" },
  { name: "Documents", icon: FileText, href: "/documents" },
];

export default function Sidebar() {
const pathname = usePathname();

const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={`p-6 flex items-center ${
        collapsed ? "justify-center" : "gap-3"
      }`}>
        <Droplets size={28} className="text-blue-400 shrink-0" />

        {!collapsed && (
          <h1 className="text-lg font-bold whitespace-nowrap">
            ABC.AI
          </h1>
        )}
      </div>

      {/* Desktop Collapse Button */}
      <div className={`px-4 hidden md:flex ${
        collapsed ? "justify-center" : "justify-end"
      }`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-slate-800"
          aria-label="Toggle sidebar width"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
                mounted &&
                (pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href + "/")));

            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : ""}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center ${
                  collapsed ? "justify-center" : "gap-3"
                } px-3 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon size={20} className="shrink-0" />
                <span className={collapsed ? "hidden" : ""}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Settings */}
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center ${
            collapsed ? "justify-center" : "gap-3"
          } px-3 py-3 rounded-lg text-slate-300 hover:bg-slate-800`}
        >
          <Settings size={20} />
          {!collapsed && "Settings"}
        </Link>

        {/* Help */}
        <Link
          href="/help"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center ${
            collapsed ? "justify-center" : "gap-3"
          } px-3 py-3 rounded-lg text-slate-300 hover:bg-slate-800`}
        >
          <HelpCircle size={20} />
          {!collapsed && "Help & Support"}
        </Link>
      </nav>

      {/* Admin Profile */}
      <div className={`border-t border-slate-800 p-4 flex items-center ${
        collapsed ? "justify-center" : "gap-3"
      }`}>
        <User size={22} className="shrink-0" />

        {!collapsed && (
          <>
            <div className="flex-1">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
            <LogOut size={18} className="text-slate-400" />
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-950 text-white rounded-lg shadow-lg"
        aria-label="Open navigation"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 w-64 h-screen bg-slate-950 text-white flex flex-col transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-5 right-4 text-slate-400 hover:text-white"
          aria-label="Close navigation"
        >
          <X size={22} />
        </button>

        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex ${
          collapsed ? "w-20" : "w-64"
        } h-screen sticky top-0 bg-slate-950 text-white flex-col shrink-0 transition-all duration-300 overflow-y-auto`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
