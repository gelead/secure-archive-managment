import React, { useState, useEffect } from 'react';
import { Settings, Shield, CheckCircle, Database } from 'lucide-react';
import { api } from '../services/api';
import { AccessModel } from '../utils/constants';

const Admin = ({ user }) => {
  const [currentModel, setCurrentModel] = useState(AccessModel.RBAC);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      const model = await api.admin.getModel();
      setCurrentModel(model.model || model);
    } catch (e) {}
  };

  const handleModelChange = async (model) => {
    setLoading(true);
    try {
      await api.admin.setModel(user.accessToken, model);
      setCurrentModel(model);
    } catch (e) {
      alert('Failed to change model: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      await api.admin.backup(user.accessToken);
      alert('Backup initiated successfully');
    } catch (e) {
      alert('Backup failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-slate-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Administration</h1>
        <p className="text-slate-400">System configuration and controls</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-400" />
            Access Control Model
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Select the active security model enforced across the system
          </p>
          <div className="space-y-3">
            {Object.values(AccessModel).map((model) => (
              <button
                key={model}
                onClick={() => handleModelChange(model)}
                disabled={loading}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  currentModel === model
                    ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${currentModel === model ? 'text-blue-400' : 'text-slate-300'}`}>
                    {model}
                  </span>
                  {currentModel === model && <CheckCircle className="w-5 h-5 text-blue-500" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-green-400" />
            System Operations
          </h3>
          <div className="space-y-4">
            <button
              onClick={handleBackup}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Processing...' : 'Trigger System Backup'}
            </button>
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-400">
                Automated backups run every hour. Manual backups can be triggered at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

