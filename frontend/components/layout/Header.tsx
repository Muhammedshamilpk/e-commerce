
"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/analytics": "Analytics",
  "/assistant": "AI Assistant",
  "/products": "Products",
  "/orders": "Orders",
  "/tickets": "Customer Tickets",
  "/customers": "Customers",
  "/documents": "Documents",
  "/settings": "Settings",
  "/help": "Help & Support",
};

export default function Header() {
  const pathname = usePathname();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const pageTitle = pageTitles[pathname] || "Dashboard";

  return (
    <header className="w-full bg-white border-b border-slate-200 px-4 pl-16 md:px-6 py-4">
      <div className="flex items-center justify-between gap-4">

        {/* Page Title */}
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-slate-800">
            {pageTitle}
          </h1>
          <p className="text-sm text-slate-500">
            Home / {pageTitle}
          </p>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 md:gap-5">

          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-32 md:w-48 text-slate-700"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              className="relative p-2 rounded-lg hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell size={21} className="text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-4">
                <h3 className="font-semibold text-slate-800">
                  Notifications
                </h3>
                <p className="text-sm text-slate-500 mt-3">
                  No new notifications.
                </p>
              </div>
            )}
          </div>

          {/* Admin Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 hover:bg-slate-100 rounded-lg p-2"
            >
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>

              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-800">
                  Admin User
                </p>
                <p className="text-xs text-slate-500">
                  Administrator
                </p>
              </div>

              <ChevronDown size={16} className="text-slate-500" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-14 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-2">

                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                  <User size={17} />
                  My Profile
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                  <Settings size={17} />
                  Settings
                </button>

                <hr className="my-2 border-slate-200" />

                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-slate-100">
                  <LogOut size={17} />
                  Logout
                </button>

              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
