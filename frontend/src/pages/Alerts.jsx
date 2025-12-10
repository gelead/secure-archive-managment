import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

const Alerts = ({ user }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await api.alerts.getAll(user.accessToken, 50);
      setAlerts(data || []);
    } catch (e) {
      console.error('Failed to load alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await api.alerts.acknowledge(user.accessToken, alertId);
      await loadAlerts();
    } catch (e) {
      alert('Failed to acknowledge alert: ' + e.message);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-900/30 text-red-300 border-red-700';
      case 'HIGH':
        return 'bg-orange-900/30 text-orange-300 border-orange-700';
      case 'MEDIUM':
        return 'bg-yellow-900/30 text-yellow-300 border-yellow-700';
      default:
        return 'bg-blue-900/30 text-blue-300 border-blue-700';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-white">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Security Alerts</h1>
        <p className="text-slate-400">System alerts and notifications</p>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No alerts found</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className={`bg-slate-800 p-6 rounded-xl border ${
                alert.acknowledged ? 'border-slate-700 opacity-60' : 'border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    {alert.acknowledged && (
                      <span className="px-2 py-1 rounded text-xs bg-green-900/30 text-green-300 border border-green-700">
                        Acknowledged
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{alert.message}</h3>
                  <p className="text-sm text-slate-400 mb-2">{alert.type}</p>
                  {alert.details && (
                    <div className="mt-3 p-3 bg-slate-900 rounded border border-slate-700">
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap">
                        {JSON.stringify(alert.details, null, 2)}
                      </pre>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-3">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                {!alert.acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(alert._id)}
                    className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alerts;

