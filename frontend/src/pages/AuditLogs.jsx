import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

const AuditLogs = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await api.logs.getAll(user.accessToken, 100);
      setLogs(data || []);
    } catch (e) {
      console.error('Failed to load logs:', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'DENIED':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'ERROR':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-900/30 text-green-400 border-green-700';
      case 'DENIED':
        return 'bg-red-900/30 text-red-400 border-red-700';
      case 'ERROR':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-700';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-white">Loading logs...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Audit Logs</h1>
        <p className="text-slate-400">System activity and access records</p>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Action</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Details</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4 text-sm text-slate-300 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{log.username}</td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{log.action}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{log.details}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(log.status)}`}>
                      {getStatusIcon(log.status)}
                      <span>{log.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-mono">{log.ip || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No logs found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;

