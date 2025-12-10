import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Role } from '../utils/constants';

const Users = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.admin.getUsers(user.accessToken);
      setUsers(data || []);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (userId) => {
    if (!newRole) return;
    try {
      await api.admin.assignRole(user.accessToken, userId, newRole);
      await loadUsers();
      setSelectedUser(null);
      setNewRole('');
    } catch (e) {
      alert('Failed to assign role: ' + e.message);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: 'bg-purple-900/30 text-purple-300 border-purple-700',
      MANAGER: 'bg-blue-900/30 text-blue-300 border-blue-700',
      HR: 'bg-green-900/30 text-green-300 border-green-700',
      STAFF: 'bg-slate-700 text-slate-300 border-slate-600',
      IT: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
    };
    return colors[role] || 'bg-slate-700 text-slate-300';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-white">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-slate-400">Manage users and roles</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {users.map((u) => (
          <div
            key={u._id}
            className="bg-slate-800 p-6 rounded-xl border border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {u.username[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{u.username}</h3>
                  <p className="text-sm text-slate-400">Department: {u.department}</p>
                  <p className="text-sm text-slate-400">Clearance Level: {u.clearanceLevel}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded text-sm font-medium border ${getRoleColor(u.role)}`}>
                  {u.role}
                </span>

                {/* REPLACED ICON WITH TEXT BUTTON */}
                <button
                  onClick={() => setSelectedUser(u)}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Assign Role</h3>
            <p className="text-slate-400 mb-4">User: {selectedUser.username}</p>

            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white mb-4"
            >
              <option value="">Select role...</option>
              {Object.values(Role).map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            <div className="flex space-x-3">
              <button
                onClick={() => handleAssignRole(selectedUser._id)}
                disabled={!newRole}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg"
              >
                Assign
              </button>

              <button
                onClick={() => {
                  setSelectedUser(null);
                  setNewRole('');
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
