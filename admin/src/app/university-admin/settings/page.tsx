'use client';

import { useEffect, useState } from 'react';
import { Save, Building2, Mail, Globe, Image as ImageIcon, User } from 'lucide-react';
import api from '@/lib/api';

interface University {
  name: string;
  domain: string;
  adminEmail: string;
  logoUrl: string;
}

export default function SettingsPage() {
  const [university, setUniversity] = useState<University>({
    name: '',
    domain: '',
    adminEmail: '',
    logoUrl: '',
  });
  const [admin, setAdmin] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      const adminObj = JSON.parse(adminData);
      setAdmin({
        name: adminObj.name || '',
        email: adminObj.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      if (adminObj.universityId) {
        fetchData(adminObj.universityId);
        // Real-time updates every 60 seconds
        const interval = setInterval(() => fetchData(adminObj.universityId, true), 60000);
        return () => clearInterval(interval);
      }
    }
  }, []);

  const fetchData = async (universityId: string, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const universityRes = await api.get(`/admin/universities`).then(({ data }) =>
        data.find((u: any) => u._id === universityId)
      );

      if (universityRes) {
        setUniversity({
          name: universityRes.name,
          domain: universityRes.domain,
          adminEmail: universityRes.adminEmail,
          logoUrl: universityRes.logoUrl || '',
        });
      }

      // Note: For now, we use localStorage data for admin profile
      // The profile endpoint could be used for super admin to edit admin accounts

      if (isRefresh) {
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    try {
      const profileData = {
        name: admin.name,
        email: admin.email,
      };

      await api.put('/admin/profile', profileData);

      // Update localStorage
      const adminData = localStorage.getItem('admin');
      if (adminData) {
        const adminObj = JSON.parse(adminData);
        adminObj.name = admin.name;
        adminObj.email = admin.email;
        localStorage.setItem('admin', JSON.stringify(adminObj));
      }

      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (admin.newPassword !== admin.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    if (admin.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await api.put('/admin/change-password', {
        currentPassword: admin.currentPassword,
        newPassword: admin.newPassword,
      });
      setMessage('Password changed successfully!');
      setAdmin({ ...admin, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Failed to change password:', error);
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Failed to change password');
      }
    } finally {
      setSaving(false);
    }
  };

  const manualRefresh = () => {
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      const adminObj = JSON.parse(adminData);
      if (adminObj.universityId) {
        fetchData(adminObj.universityId);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your university and account settings</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* University Information (Read-only) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Building2 className="text-primary" size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">University Information</h2>
          <span className="ml-auto text-xs text-gray-400">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University Name
              </label>
              <input
                type="text"
                value={university.name}
                readOnly
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain
              </label>
              <div className="flex items-center gap-2">
                <Globe className="text-gray-400" size={20} />
                <input
                  type="text"
                  value={university.domain}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <div className="flex items-center gap-2">
                <Mail className="text-gray-400" size={20} />
                <input
                  type="email"
                  value={university.adminEmail}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            {university.logoUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <div className="flex items-center gap-2">
                  <ImageIcon className="text-gray-400" size={20} />
                  <input
                    type="url"
                    value={university.logoUrl}
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="text-blue-600" size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={admin.name}
              onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={admin.email}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed. Contact super admin if needed.
            </p>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={admin.currentPassword}
              onChange={(e) => setAdmin({ ...admin, currentPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={admin.newPassword}
              onChange={(e) => setAdmin({ ...admin, newPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={admin.confirmPassword}
              onChange={(e) => setAdmin({ ...admin, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Confirm new password"
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={saving || !admin.currentPassword || !admin.newPassword}
            className="flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 disabled:opacity-50 transition"
          >
            <Save size={20} />
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
