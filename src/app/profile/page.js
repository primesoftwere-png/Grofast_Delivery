'use client';

import { User, Phone, Mail, Bike, Shield, Edit } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

const Profile = () => {
  return (
    <div className="p-4">
      <div className="space-y-6 animate-fade-in max-w-2xl">

        <h1 className="text-2xl font-display font-bold text-foreground">
          Profile
        </h1>

        {/* Profile Card */}
        <div className="border border-border/50 rounded-xl">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">

              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-secondary-foreground">
                RK
              </div>

              {/* Info */}
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl font-semibold text-foreground">
                  Rahul Kumar
                </h2>

                <p className="text-sm text-muted-foreground">
                  Delivery Partner since Jan 2024
                </p>

                <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                  
                  {/* Verified Badge */}
                  <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary">
                    <Shield className="w-3 h-3" />
                    Verified
                  </span>

                  {/* Rating Badge */}
                  <span className="text-xs px-2 py-1 rounded-md border border-border">
                    ⭐ 4.8 Rating
                  </span>

                </div>
              </div>

              {/* Edit Button */}
              <button className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg border border-border">
                <Edit className="w-4 h-4" />
                Edit
              </button>

            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Contact */}
          <div className="border border-border/50 rounded-xl">
            <div className="p-4 pb-2">
              <p className="text-sm text-muted-foreground">Contact</p>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  +91 9876543210
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  rahul@email.com
                </span>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  B-12, Sector 18, Noida
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle */}
          <div className="border border-border/50 rounded-xl">
            <div className="p-4 pb-2">
              <p className="text-sm text-muted-foreground">Vehicle</p>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Bike className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Bike</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-foreground">
                  UP 16 AB 1234
                </span>
              </div>

              {/* Badge */}
              <span className="inline-block text-xs px-2 py-1 rounded-md bg-primary/10 text-primary">
                Documents Verified
              </span>
            </div>
          </div>

        </div>

        {/* Logout Section */}
        <div className="border border-border/50 rounded-xl">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Account Actions
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sign out of your delivery partner account
            </p>
            <LogoutButton />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;