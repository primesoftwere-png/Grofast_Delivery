'use client';

import { useState } from "react";
import { User, Bike, FileText, Lock, Bell } from "lucide-react";

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="p-4">
      <div className="space-y-6 animate-fade-in max-w-2xl">

        <h1 className="text-2xl font-display font-bold text-foreground">
          Settings
        </h1>

        {/* Personal Details */}
        <div className="border border-border/50 rounded-xl">
          <div className="p-4 pb-3">
            <p className="text-base flex items-center gap-2 font-semibold">
              <User className="w-4 h-4" /> Personal Details
            </p>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="space-y-2">
                <label className="text-sm">Full Name</label>
                <input defaultValue="Rahul Kumar" className="w-full border border-border rounded-lg px-3 py-2" />
              </div>

              <div className="space-y-2">
                <label className="text-sm">Phone</label>
                <input defaultValue="+91 9876543210" className="w-full border border-border rounded-lg px-3 py-2" />
              </div>

              <div className="space-y-2">
                <label className="text-sm">Email</label>
                <input defaultValue="rahul@email.com" className="w-full border border-border rounded-lg px-3 py-2" />
              </div>

              <div className="space-y-2">
                <label className="text-sm">Address</label>
                <input defaultValue="B-12, Sector 18, Noida" className="w-full border border-border rounded-lg px-3 py-2" />
              </div>

            </div>

            <button className="text-sm px-3 py-2 rounded-lg bg-primary text-primary-foreground">
              Save Changes
            </button>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="border border-border/50 rounded-xl">
          <div className="p-4 pb-3">
            <p className="text-base flex items-center gap-2 font-semibold">
              <Bike className="w-4 h-4" /> Vehicle Details
            </p>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="space-y-2">
                <label>Vehicle Type</label>
                <input defaultValue="Bike" className="w-full border border-border rounded-lg px-3 py-2" />
              </div>

              <div className="space-y-2">
                <label>Vehicle Number</label>
                <input defaultValue="UP 16 AB 1234" className="w-full border border-border rounded-lg px-3 py-2" />
              </div>

            </div>

            <button className="text-sm px-3 py-2 rounded-lg bg-primary text-primary-foreground">
              Update Vehicle
            </button>
          </div>
        </div>

        {/* Documents */}
        <div className="border border-border/50 rounded-xl">
          <div className="p-4 pb-3">
            <p className="text-base flex items-center gap-2 font-semibold">
              <FileText className="w-4 h-4" /> Documents
            </p>
          </div>

          <div className="p-4 space-y-3">
            {["Driving License", "Bike Photo", "Number Plate", "Insurance"].map((doc) => (
              <div key={doc} className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">{doc}</span>

                <button className="text-sm px-3 py-1 rounded-lg border border-border">
                  Re-upload
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Change Password */}
        <div className="border border-border/50 rounded-xl">
          <div className="p-4 pb-3">
            <p className="text-base flex items-center gap-2 font-semibold">
              <Lock className="w-4 h-4" /> Change Password
            </p>
          </div>

          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label>Current Password</label>
              <input type="password" className="w-full border border-border rounded-lg px-3 py-2" />
            </div>

            <div className="space-y-2">
              <label>New Password</label>
              <input type="password" className="w-full border border-border rounded-lg px-3 py-2" />
            </div>

            <div className="space-y-2">
              <label>Confirm Password</label>
              <input type="password" className="w-full border border-border rounded-lg px-3 py-2" />
            </div>

            <button className="text-sm px-3 py-2 rounded-lg bg-primary text-primary-foreground">
              Update Password
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="border border-border/50 rounded-xl">
          <div className="p-4 pb-3">
            <p className="text-base flex items-center gap-2 font-semibold">
              <Bell className="w-4 h-4" /> Notifications
            </p>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Push Notifications
                </p>
                <p className="text-xs text-muted-foreground">
                  Receive alerts for new orders
                </p>
              </div>

              {/* Switch */}
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                  notifications ? "bg-primary" : "bg-muted"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition ${
                    notifications ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;