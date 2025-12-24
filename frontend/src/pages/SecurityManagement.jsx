import React, { useState, useEffect } from 'react';
import { Shield, Lock, FileText } from 'lucide-react';
import { api } from '../services/api';
import { SecurityLevel } from '../utils/constants';

const SecurityManagement = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('clearance');

  useEffect(() => {
    if (activeTab === 'clearance') {
      loadClearanceLevels();
    } else {
      loadSecurityLabels();
    }
  }, [activeTab]);

  const loadClearanceLevels = async () => {
    try {
      const data = await api.security.getClearanceLevels(user.accessToken);
      setUsers(data);
    } catch (e) {
      alert('Failed to load clearance levels: ' + e.message);
    }
  };

  const loadSecurityLabels = async () => {
    try {
      const data = await api.security.getLabels(user.accessToken);
      setFiles(data);
    } catch (e) {
      alert('Failed to load security labels: ' + e.message);
    }
  };

  const updateClearanceLevel = async (userId, level) => {
    setLoading(true);
    try {
      await api.security.updateClearanceLevel(user.accessToken, userId, level);
      await loadClearanceLevels();
    } catch (e) {
      alert('Failed to update clearance level: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSecurityLabel = async (fileId, classification) => {
    setLoading(true);
    try {
      await api.security.updateLabel(user.accessToken, fileId, classification);
      await loadSecurityLabels();
    } catch (e) {
      alert('Failed to update security label: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const getLevelName = (level) => {
    switch (level) {
      case SecurityLevel.PUBLIC: return 'Public';
      case SecurityLevel.INTERNAL: return 'Internal';
      case SecurityLevel.CONFIDENTIAL: return 'Confidential';
      case SecurityLevel.TOP_SECRET: return 'Top Secret';
      default: return 'Unknown';
    }
  };

  return (
    <div className="p-8 bg-slate-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Security Management</h1>
        <p className="text-slate-400">Manage security labels and clearance levels (MAC)</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('clearance')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'clearance'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Lock className="w-4 h-4 inline mr-2" />
          Clearance Levels
        </button>
        <button
          onClick={() => setActiveTab('labels')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'labels'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Security Labels
        </button>
      </div>

      {activeTab === 'clearance' && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-400" />
            User Clearance Levels
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Clearance levels determine what security classifications users can access. Only administrators can modify these.
          </p>
          {users.length === 0 ? (
            <p className="text-slate-400">No users found</p>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u._id}
                  className="bg-slate-900 p-4 rounded-lg border border-slate-700 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-white">{u.username}</div>
                    <div className="text-sm text-slate-400">
                      Role: {u.role} | Department: {u.department || 'N/A'} | Current Level: {getLevelName(u.clearanceLevel || 1)}
                    </div>
                  </div>
                  <select
                    value={u.clearanceLevel || 1}
                    onChange={(e) => updateClearanceLevel(u._id, parseInt(e.target.value))}
                    disabled={loading}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value={SecurityLevel.PUBLIC}>Public (Level 1)</option>
                    <option value={SecurityLevel.INTERNAL}>Internal (Level 2)</option>
                    <option value={SecurityLevel.CONFIDENTIAL}>Confidential (Level 3)</option>
                    <option value={SecurityLevel.TOP_SECRET}>Top Secret (Level 4)</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'labels' && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-green-400" />
            File Security Labels
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Security labels classify files by sensitivity. Only administrators can modify these labels.
          </p>
          {files.length === 0 ? (
            <p className="text-slate-400">No files found</p>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file._id}
                  className="bg-slate-900 p-4 rounded-lg border border-slate-700 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-white">{file.name}</div>
                    <div className="text-sm text-slate-400">
                      Department: {file.department || 'N/A'} | Current Label: {getLevelName(file.classification || SecurityLevel.PUBLIC)}
                    </div>
                  </div>
                  <select
                    value={file.classification || SecurityLevel.PUBLIC}
                    onChange={(e) => updateSecurityLabel(file._id, parseInt(e.target.value))}
                    disabled={loading}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value={SecurityLevel.PUBLIC}>Public</option>
                    <option value={SecurityLevel.INTERNAL}>Internal</option>
                    <option value={SecurityLevel.CONFIDENTIAL}>Confidential</option>
                    <option value={SecurityLevel.TOP_SECRET}>Top Secret</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SecurityManagement;

