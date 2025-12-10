import React, { useState, useEffect } from 'react';
import { UserPlus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { api } from '../services/api';
import { Role } from '../utils/constants';

const RoleRequests = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestedRole, setRequestedRole] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await api.roles.getRequests(user.accessToken);
      setRequests(data);
    } catch (e) {
      alert('Failed to load requests: ' + e.message);
    }
  };

  const handleRequestRole = async () => {
    if (!requestedRole) {
      alert('Please select a role');
      return;
    }
    setLoading(true);
    try {
      await api.roles.requestRole(user.accessToken, requestedRole);
      setRequestedRole('');
      await loadRequests();
      alert('Role request submitted successfully');
    } catch (e) {
      alert('Failed to submit request: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!confirm('Approve this role request?')) return;
    setLoading(true);
    try {
      await api.roles.approveRequest(user.accessToken, requestId);
      await loadRequests();
    } catch (e) {
      alert('Failed to approve: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    setLoading(true);
    try {
      await api.roles.rejectRequest(user.accessToken, requestId, reason);
      await loadRequests();
    } catch (e) {
      alert('Failed to reject: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="p-8 bg-slate-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Role Requests</h1>
        <p className="text-slate-400">Request role changes or manage pending requests</p>
      </div>

      {!isAdmin && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <UserPlus className="w-5 h-5 mr-2 text-blue-400" />
            Request New Role
          </h3>
          <div className="flex gap-4">
            <select
              value={requestedRole}
              onChange={(e) => setRequestedRole(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Select Role</option>
              {Object.values(Role).map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <button
              onClick={handleRequestRole}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Requests</h3>
        {requests.length === 0 ? (
          <p className="text-slate-400">No role requests found</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="bg-slate-900 p-4 rounded-lg border border-slate-700 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-white">{req.username}</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-blue-400 font-semibold">{req.requestedRole}</span>
                    {req.currentRole && (
                      <>
                        <span className="text-slate-500">(from {req.currentRole})</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>Status: {req.status}</span>
                    <span>Created: {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {isAdmin && req.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(req._id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(req._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
                {req.status === 'APPROVED' && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
                {req.status === 'REJECTED' && (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
                {req.status === 'PENDING' && !isAdmin && (
                  <Clock className="w-6 h-6 text-yellow-500" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleRequests;

