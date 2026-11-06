
"use client";

import { useState } from "react";
import {
  Settings,
  User,
  Store,
  Bell,
  Shield,
  Save,
  Mail,
  Phone,
  MapPin,
  Lock,
  CheckCircle,
} from "lucide-react";

type Tab = "General" | "Profile" | "Notifications" | "Security";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("General");
  const [saved, setSaved] = useState(false);

  const [store, setStore] = useState({
    name: "ABC",
    email: "support@abc.com",
    phone: "+91 9874563210",
    address: "Bengaluru, Karnataka, India",
    website: "https://abc.com",
  });

  const [profile, setProfile] = useState({
    name: "Admin",
    email: "admin@abc.com",
    phone: "+91 9876543210",
  });

  const [notifications, setNotifications] = useState({
    orders: true,
    customers: true,
    tickets: true,
    marketing: false,
    email: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const tabs: {
    name: Tab;
    icon: React.ElementType;
    description: string;
  }[] = [
    {
      name: "General",
      icon: Store,
      description: "Manage store information",
    },
    {
      name: "Profile",
      icon: User,
      description: "Manage admin profile",
    },
    {
      name: "Notifications",
      icon: Bell,
      description: "Configure notifications",
    },
    {
      name: "Security",
      icon: Shield,
      description: "Manage account security",
    },
  ];

  const handleSave = () => {
    if (
      activeTab === "Security" &&
      (passwords.current || passwords.newPassword || passwords.confirm)
    ) {
      if (!passwords.current || !passwords.newPassword || !passwords.confirm) {
        alert("Please fill in all password fields.");
        return;
      }

      if (passwords.newPassword.length < 8) {
        alert("New password must contain at least 8 characters.");
        return;
      }

      if (passwords.newPassword !== passwords.confirm) {
        alert("New password and confirm password do not match.");
        return;
      }

      alert("Demo only: Password change requires backend integration.");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass =
    "w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-500";

  const labelClass =
    "block text-sm font-medium text-slate-700 mb-2";

  return (
    <div className="space-y-6">

      {/* Page Heading */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
          <Settings size={25} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your store preferences and account settings.
          </p>
        </div>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sidebar Tabs */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 h-fit">

          <h3 className="text-xs font-semibold text-slate-400 uppercase px-3 py-3">
            Settings Menu
          </h3>

          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.name;

              return (
                <button
                  key={tab.name}
                  onClick={() => {
                    setActiveTab(tab.name);
                    setSaved(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={19} />

                  <div>
                    <p className="text-sm font-medium">
                      {tab.name}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      isActive ? "text-blue-500" : "text-slate-400"
                    }`}>
                      {tab.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6">

          {/* General Settings */}
          {activeTab === "General" && (
            <div className="space-y-6">

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  General Settings
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Update your store's basic information.
                </p>
              </div>

              <div>
                <label className={labelClass}>Store Name</label>
                <input
                  className={inputClass}
                  value={store.name}
                  onChange={(e) =>
                    setStore({ ...store, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Store Email</label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    className={`${inputClass} pl-10`}
                    value={store.email}
                    onChange={(e) =>
                      setStore({ ...store, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Contact Number</label>
                <div className="relative">
                  <Phone size={17} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    className={`${inputClass} pl-10`}
                    value={store.phone}
                    onChange={(e) =>
                      setStore({ ...store, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Store Address</label>
                <div className="relative">
                  <MapPin size={17} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    className={`${inputClass} pl-10`}
                    value={store.address}
                    onChange={(e) =>
                      setStore({ ...store, address: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Website</label>
                <input
                  className={inputClass}
                  value={store.website}
                  onChange={(e) =>
                    setStore({ ...store, website: e.target.value })
                  }
                />
              </div>

            </div>
          )}

          {/* Profile Settings */}
          {activeTab === "Profile" && (
            <div className="space-y-6">

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Admin Profile
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Manage your personal account information.
                </p>
              </div>

              {/* Profile Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold">
                  {profile.name.trim().charAt(0).toUpperCase() || "A"}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {profile.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Administrator
                  </p>
                </div>
              </div>

              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  className={inputClass}
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  className={inputClass}
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Phone Number</label>
                <input
                  className={inputClass}
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                />
              </div>

            </div>
          )}

          {/* Notification Settings */}
          {activeTab === "Notifications" && (
            <div className="space-y-6">

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Notification Preferences
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Choose which notifications you want to receive.
                </p>
              </div>

              {[
                {
                  key: "orders" as const,
                  title: "Order Notifications",
                  description: "Get notified when a new order is placed.",
                },
                {
                  key: "customers" as const,
                  title: "Customer Notifications",
                  description: "Get notified when a new customer registers.",
                },
                {
                  key: "tickets" as const,
                  title: "Support Ticket Notifications",
                  description: "Get notified when a customer creates a ticket.",
                },
                {
                  key: "marketing" as const,
                  title: "Marketing Notifications",
                  description: "Receive promotional and marketing updates.",
                },
                {
                  key: "email" as const,
                  title: "Email Notifications",
                  description: "Receive notifications through email.",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex justify-between items-center gap-4 border-b border-slate-100 pb-5"
                >
                  <div>
                    <h3 className="text-sm font-medium text-slate-800">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifications[item.key]}
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        [item.key]: !notifications[item.key],
                      })
                    }
                    className={`w-12 h-6 rounded-full relative transition shrink-0 ${
                      notifications[item.key]
                        ? "bg-blue-600"
                        : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                        notifications[item.key]
                          ? "left-7"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>
              ))}

            </div>
          )}

          {/* Security Settings */}
          {activeTab === "Security" && (
            <div className="space-y-6">

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Security Settings
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Manage password and account security.
                </p>
              </div>

              {/* Password */}
              <div className="space-y-4">

                <h3 className="font-medium text-slate-800">
                  Change Password
                </h3>

                <div>
                  <label className={labelClass}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    className={inputClass}
                    placeholder="Enter current password"
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        current: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    New Password
                  </label>
                  <input
                    type="password"
                    className={inputClass}
                    placeholder="Enter new password"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className={inputClass}
                    placeholder="Confirm new password"
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        confirm: e.target.value,
                      })
                    }
                  />
                </div>

              </div>

              {/* Two Factor Authentication */}
              <div className="border-t border-slate-100 pt-6">

                <div className="flex justify-between items-center gap-4">

                  <div className="flex gap-3">
                    <div className="p-3 bg-green-50 rounded-lg text-green-600">
                      <Shield size={22} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Add an extra layer of security to your account.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={security.twoFactor}
                    onClick={() =>
                      setSecurity({
                        ...security,
                        twoFactor: !security.twoFactor,
                      })
                    }
                    className={`w-12 h-6 rounded-full relative transition shrink-0 ${
                      security.twoFactor
                        ? "bg-blue-600"
                        : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                        security.twoFactor
                          ? "left-7"
                          : "left-1"
                      }`}
                    />
                  </button>

                </div>

                <p className="text-xs text-slate-500 mt-4">
                  Current preference: {security.twoFactor ? "Enabled" : "Disabled"}
                </p>

              </div>

            </div>
          )}

          {/* Save Button */}
          <div className="border-t border-slate-100 mt-8 pt-5 flex flex-col sm:flex-row justify-between items-center gap-4">

            <div>
              {saved && (
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle size={17} />
                  Changes updated in this session.
                </p>
              )}
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium"
            >
              <Save size={17} />
              Save Changes
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
