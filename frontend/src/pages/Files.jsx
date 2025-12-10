import React, { useState, useEffect } from 'react';
import { FileText, Lock, Unlock, Share2, Eye, AlertCircle, Users } from 'lucide-react';
import { api } from '../services/api';
import { AccessModel } from '../utils/constants';

const Files = ({ user }) => {
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentModel, setCurrentModel] = useState(AccessModel.RBAC);
  const [selectedFile, setSelectedFile] = useState(null);
  const [accessResult, setAccessResult] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTarget, setShareTarget] = useState('');
  const [sharePermissions, setSharePermissions] = useState(['read']);

  useEffect(() => {
    loadFiles();
    loadModel();
    if (user.role === 'ADMIN') {
      loadUsers();
    }
  }, []);

  const loadFiles = async () => {
    try {
      const data = await api.files.getAll(user.accessToken);
      setFiles(data || []);
    } catch (e) {
      console.error('Failed to load files:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.admin.getUsers(user.accessToken);
      setUsers(data || []);
    } catch (e) {
      console.error('Failed to load users:', e);
    }
  };

  const handleShare = async () => {
    if (!shareTarget || !selectedFile) return;
    try {
      await api.files.share(user.accessToken, selectedFile._id, shareTarget, sharePermissions);
      setShowShareModal(false);
      setShareTarget('');
      await loadFiles();
      alert('File shared successfully');
    } catch (e) {
      alert('Failed to share file: ' + e.message);
    }
  };

  const loadModel = async () => {
    try {
      const model = await api.admin.getModel();
      setCurrentModel(model.model || model);
    } catch (e) {}
  };

  const handleAccessCheck = async (file) => {
    try {
      const result = await api.files.checkAccess(user.accessToken, file._id);
      setSelectedFile(file);
      setAccessResult(result);
    } catch (e) {
      setAccessResult({ allowed: false, reason: e.message });
    }
  };

  const getClassificationColor = (level) => {
    if (level === 3) return 'bg-red-900/30 text-red-300 border-red-700';
    if (level === 2) return 'bg-orange-900/30 text-orange-300 border-orange-700';
    return 'bg-green-900/30 text-green-300 border-green-700';
  };

  const getClassificationLabel = (level) => {
    if (level === 3) return 'Confidential';
    if (level === 2) return 'Internal';
    return 'Public';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-white">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-900 min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Files & Records</h1>
          <p className="text-slate-400">Archive management and access control</p>
        </div>
        <div className="px-4 py-2 bg-blue-900/30 text-blue-300 rounded-lg border border-blue-800">
          Mode: {currentModel}
        </div>
      </div>

      {accessResult && selectedFile && (
        <div className={`mb-6 p-4 rounded-lg border ${
          accessResult.allowed 
            ? 'bg-green-900/20 border-green-700' 
            : 'bg-red-900/20 border-red-700'
        }`}>
          <div className="flex items-start space-x-3">
            {accessResult.allowed ? (
              <Unlock className="w-5 h-5 text-green-400 mt-0.5" />
            ) : (
              <Lock className="w-5 h-5 text-red-400 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className={`font-semibold mb-1 ${
                accessResult.allowed ? 'text-green-300' : 'text-red-300'
              }`}>
                {accessResult.allowed ? 'Access Granted' : 'Access Denied'}
              </h3>
              <p className="text-sm text-slate-300 mb-2">File: {selectedFile.name}</p>
              <p className="text-xs text-slate-400">{accessResult.reason}</p>
              {accessResult.allowed && accessResult.file && (
                <div className="mt-3 p-3 bg-slate-900 rounded border border-slate-700">
                  <p className="text-sm text-slate-300">{accessResult.file.content}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setAccessResult(null);
                setSelectedFile(null);
              }}
              className="text-slate-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {files.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No files found</p>
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file._id}
              className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{file.name}</h3>
                      <p className="text-sm text-slate-400">Type: {file.type.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getClassificationColor(file.classification)}`}>
                      {getClassificationLabel(file.classification)}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-slate-700 text-slate-300">
                      Dept: {file.department}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-slate-700 text-slate-300">
                      Owner: {file.ownerId}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccessCheck(file)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Check Access</span>
                  </button>
                  {currentModel === AccessModel.DAC && file.ownerId === user._id && (
                    <button
                      onClick={() => {
                        setSelectedFile(file);
                        setShowShareModal(true);
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showShareModal && selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Share2 className="w-5 h-5 mr-2 text-green-400" />
              Share File: {selectedFile.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Share with User</label>
                <select
                  value={shareTarget}
                  onChange={(e) => setShareTarget(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Select User</option>
                  {users.filter(u => u._id !== user._id).map((u) => (
                    <option key={u._id} value={u._id}>{u.username} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Permissions</label>
                <div className="space-y-2">
                  {['read', 'write', 'delete'].map((perm) => (
                    <label key={perm} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sharePermissions.includes(perm)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSharePermissions([...sharePermissions, perm]);
                          } else {
                            setSharePermissions(sharePermissions.filter(p => p !== perm));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-slate-300 capitalize">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  Share
                </button>
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    setShareTarget('');
                    setSharePermissions(['read']);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Files;

