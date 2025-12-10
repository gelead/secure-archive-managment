import React, { useState, useEffect } from 'react';
import { Database, Download, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

const Backups = ({ user }) => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const data = await api.admin.getBackups(user.accessToken);
      setBackups(data || []);
    } catch (e) {
      console.error('Failed to load backups:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      await api.admin.backup(user.accessToken);
      await loadBackups();
      alert('Backup created successfully');
    } catch (e) {
      alert('Failed to create backup: ' + e.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-white">Loading backups...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-900 min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Backups</h1>
          <p className="text-slate-400">System backup management</p>
        </div>
        <button
          onClick={handleCreateBackup}
          disabled={creating}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${creating ? 'animate-spin' : ''}`} />
          <span>{creating ? 'Creating...' : 'Create Backup'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {backups.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
            <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No backups found</p>
          </div>
        ) : (
          backups.map((backup) => (
            <div
              key={backup.name}
              className="bg-slate-800 p-6 rounded-xl border border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Database className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{backup.name}</h3>
                    <p className="text-sm text-slate-400">
                      Created: {new Date(backup.timestamp).toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-400">
                      Triggered by: {backup.triggeredBy}
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Backups;

