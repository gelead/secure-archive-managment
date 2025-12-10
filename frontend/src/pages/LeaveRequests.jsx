import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { api } from '../services/api';

const LeaveRequests = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await api.leave.getRequests(user.accessToken);
      setRequests(data);
    } catch (e) {
      alert('Failed to load requests: ' + e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      alert('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await api.leave.createRequest(user.accessToken, formData.startDate, formData.endDate, formData.reason);
      setFormData({ startDate: '', endDate: '', reason: '' });
      setShowForm(false);
      await loadRequests();
      alert('Leave request submitted successfully');
    } catch (e) {
      alert('Failed to submit request: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!confirm('Approve this leave request?')) return;
    setLoading(true);
    try {
      await api.leave.approveRequest(user.accessToken, requestId, 'office', 'company-laptop');
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
      await api.leave.rejectRequest(user.accessToken, requestId, reason);
      await loadRequests();
    } catch (e) {
      alert('Failed to reject: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const canApprove = ['ADMIN', 'HR', 'MANAGER'].includes(user.role);

  return (
    <div className="p-8 bg-slate-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Leave Requests</h1>
        <p className="text-slate-400">Submit leave requests or manage pending approvals</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Calendar className="w-5 h-5" />
          {showForm ? 'Cancel' : 'New Leave Request'}
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create Leave Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                rows="3"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Leave Requests</h3>
        {requests.length === 0 ? (
          <p className="text-slate-400">No leave requests found</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const days = req.days || Math.ceil((new Date(req.endDate) - new Date(req.startDate)) / (1000 * 60 * 60 * 24)) + 1;
              return (
                <div
                  key={req._id}
                  className="bg-slate-900 p-4 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-white">{req.username}</span>
                      <span className="text-slate-400 ml-4">{days} day{days !== 1 ? 's' : ''}</span>
                    </div>
                    {canApprove && req.status === 'PENDING' && (
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
                    {req.status === 'PENDING' && !canApprove && (
                      <Clock className="w-6 h-6 text-yellow-500" />
                    )}
                  </div>
                  <div className="text-sm text-slate-400 space-y-1">
                    <div>Period: {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</div>
                    <div>Reason: {req.reason}</div>
                    <div>Status: {req.status}</div>
                    {req.status === 'REJECTED' && req.rejectionReason && (
                      <div className="text-red-400">Rejection reason: {req.rejectionReason}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveRequests;

