import React, { useState, useEffect } from 'react';
import { User, Save, Lock, Shield } from 'lucide-react';
import { api } from '../services/api';
import MFASetup from './MFASetup';

const Profile = ({ user: currentUser }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showMFASetup, setShowMFASetup] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.profile.get(currentUser.accessToken);
      setProfile(data);
      setFormData({
        firstName: data.profile?.firstName || '',
        lastName: data.profile?.lastName || '',
        bio: data.profile?.bio || '',
      });
    } catch (e) {
      console.error('Failed to load profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.profile.update(currentUser.accessToken, formData);
      await loadProfile();
      alert('Profile updated successfully');
    } catch (e) {
      alert('Failed to update profile: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await api.auth.changePassword(
        currentUser.accessToken,
        passwordForm.oldPassword,
        passwordForm.newPassword
      );
      alert('Password changed successfully');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (e) {
      alert('Failed to change password: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-slate-400">Manage your account information</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-400" />
            Personal Information
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1 text-sm">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 text-sm">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-300 mb-1 text-sm">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                rows={4}
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-red-400" />
            Security
          </h3>
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Change Password
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-1 text-sm">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 text-sm">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 text-sm">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handlePasswordChange}
                  disabled={saving}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-400" />
            Multi-Factor Authentication
          </h3>
          {profile?.mfaEnabled ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-800 rounded-lg">
                <div>
                  <p className="text-green-300 font-medium">MFA Enabled</p>
                  <p className="text-slate-400 text-sm">Your account is protected with multi-factor authentication</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-slate-400 text-sm mb-4">
                Add an extra layer of security to your account with multi-factor authentication.
              </p>
              {!showMFASetup ? (
                <button
                  onClick={() => setShowMFASetup(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Enable MFA
                </button>
              ) : (
                <MFASetup
                  user={currentUser}
                  onComplete={(type) => {
                    setShowMFASetup(false);
                    loadProfile();
                    alert(`MFA enabled successfully using ${type}!`);
                  }}
                />
              )}
            </div>
          )}
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Username</span>
              <span className="text-white">{profile?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Email</span>
              <span className="text-white">{profile?.email || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Role</span>
              <span className="text-white">{profile?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Department</span>
              <span className="text-white">{profile?.department}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

