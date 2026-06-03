'use client';

import { useState, useEffect } from "react";
import { User, Bike, FileText, Lock, Bell, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { deliveryAuthAPI } from "@/lib/api";

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const { profile, isLoading, updateProfile, error } = useProfile();
  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    email: '',
    address: ''
  });
  const [vehicleData, setVehicleData] = useState({
    vehicleType: '',
    vehicleNumber: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    if (profile) {
      const pUser = profile.user || {};
      const pDelivery = profile.deliveryBoy || {};
      
      let addressStr = '';
      if (typeof pDelivery.address === 'string') {
        addressStr = pDelivery.address;
      } else if (pDelivery.address) {
        const addrParts = [pDelivery.address.street, pDelivery.address.city, pDelivery.address.state, pDelivery.address.pincode].filter(Boolean);
        addressStr = addrParts.join(', ');
      }

      setFormData({
        fullname: pUser.fullname || (pDelivery.firstName ? `${pDelivery.firstName} ${pDelivery.lastName || ''}`.trim() : ''),
        phone: pUser.phone || '',
        email: pUser.email || '',
        address: addressStr,
      });

      setVehicleData({
        vehicleType: pDelivery.vehicleType || '',
        vehicleNumber: pDelivery.vehicleNumber || ''
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeVehicle = (e) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    setUpdateMessage('');
    try {
      await updateProfile(formData);
      setUpdateMessage('Profile updated successfully!');
    } catch (err) {
      setUpdateMessage(err.message || 'Error updating profile');
    } finally {
      setIsUpdating(false);
      setTimeout(() => setUpdateMessage(''), 3000);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const submitPasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('New passwords do not match');
      return;
    }
    setIsChangingPassword(true);
    setPasswordMessage('');
    try {
      await deliveryAuthAPI.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordMessage('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMessage(err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
      setTimeout(() => setPasswordMessage(''), 3000);
    }
  };

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
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {updateMessage && (
                  <div className={`p-3 rounded-lg text-sm ${updateMessage.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {updateMessage}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm">Full Name</label>
                    <input name="fullname" value={formData.fullname} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm">Phone</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm">Email</label>
                    <input name="email" value={formData.email} disabled className="w-full border border-border rounded-lg px-3 py-2 bg-muted cursor-not-allowed" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm">Address</label>
                    <input name="address" value={formData.address} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2" />
                  </div>
                </div>

                <button onClick={handleUpdateProfile} disabled={isUpdating} className="text-sm px-3 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 flex items-center gap-2">
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Changes
                </button>
              </>
            )}
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
                <input name="vehicleType" value={vehicleData.vehicleType} onChange={handleChangeVehicle} className="w-full border border-border rounded-lg px-3 py-2" />
              </div>

              <div className="space-y-2">
                <label>Vehicle Number</label>
                <input name="vehicleNumber" value={vehicleData.vehicleNumber} onChange={handleChangeVehicle} className="w-full border border-border rounded-lg px-3 py-2" />
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
            {passwordMessage && (
              <div className={`p-3 rounded-lg text-sm ${passwordMessage.includes('Failed') || passwordMessage.includes('do not match') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {passwordMessage}
              </div>
            )}
            <div className="space-y-2">
              <label>Current Password</label>
              <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full border border-border rounded-lg px-3 py-2" />
            </div>

            <div className="space-y-2">
              <label>New Password</label>
              <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full border border-border rounded-lg px-3 py-2" />
            </div>

            <div className="space-y-2">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="w-full border border-border rounded-lg px-3 py-2" />
            </div>

            <button onClick={submitPasswordChange} disabled={isChangingPassword} className="text-sm px-3 py-2 rounded-lg bg-primary text-primary-foreground flex items-center gap-2 disabled:opacity-50">
              {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
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