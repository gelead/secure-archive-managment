import React, { useState, useEffect } from 'react';
import { Shield, FileText, Users, Activity, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import { AccessModel } from '../utils/constants';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    files: 0,
    users: 0,
    logs: 0,
    alerts: 0,
  });
  const [currentModel, setCurrentModel] = useState(AccessModel.RBAC);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [files, users, logs, alerts, model] = await Promise.all([
        api.files.getAll(user.accessToken).catch(() => []),
        user.role === 'ADMIN' ? api.admin.getUsers(user.accessToken).catch(() => []) : Promise.resolve([]),
        user.role === 'ADMIN' ? api.logs.getAll(user.accessToken, 10).catch(() => []) : Promise.resolve([]),
        user.role === 'ADMIN' ? api.alerts.getAll(user.accessToken, 10).catch(() => []) : Promise.resolve([]),
        api.admin.getModel().catch(() => ({ model: AccessModel.RBAC })),
      ]);

      setStats({
        files: files.length || 0,
        users: users.length || 0,
        logs: logs.length || 0,
        alerts: alerts.filter(a => !a.acknowledged).length || 0,
      });
      setCurrentModel(model.model || model);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Welcome back, {user.username}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Files</p>
              <h3 className="text-3xl font-bold text-white">{stats.files}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        {user.role === 'ADMIN' && (
          <>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Total Users</p>
                  <h3 className="text-3xl font-bold text-white">{stats.users}</h3>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Recent Logs</p>
                  <h3 className="text-3xl font-bold text-white">{stats.logs}</h3>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Activity className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Active Alerts</p>
                  <h3 className="text-3xl font-bold text-white">{stats.alerts}</h3>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Active Security Model</h3>
            <p className="text-slate-400 text-sm">Current access control enforcement</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{currentModel}</div>
              <div className="text-xs text-slate-400">Access Control</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/files"
              className="block p-4 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">Browse Files</span>
              </div>
            </a>
            {user.role === 'ADMIN' && (
              <>
                <a
                  href="/users"
                  className="block p-4 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">Manage Users</span>
                  </div>
                </a>
                <a
                  href="/admin"
                  className="block p-4 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">Admin Settings</span>
                  </div>
                </a>
              </>
            )}
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-900 rounded border border-slate-700">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white text-sm">Database</span>
              </div>
              <span className="text-green-400 text-sm font-medium">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900 rounded border border-slate-700">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="text-white text-sm">Security</span>
              </div>
              <span className="text-green-400 text-sm font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900 rounded border border-slate-700">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span className="text-white text-sm">Performance</span>
              </div>
              <span className="text-green-400 text-sm font-medium">Optimal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

