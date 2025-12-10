import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import Users from './pages/Users';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import AuditLogs from './pages/AuditLogs';
import Alerts from './pages/Alerts';
import Backups from './pages/Backups';
import RoleRequests from './pages/RoleRequests';
import LeaveRequests from './pages/LeaveRequests';
import SecurityManagement from './pages/SecurityManagement';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const AppRoutes = () => {
  const { user, logout } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        <Route
          path="/*"
          element={
            user ? (
              <Layout user={user} onLogout={logout}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard user={user} />} />
                  <Route path="/files" element={<Files user={user} />} />
                  <Route path="/role-requests" element={<RoleRequests user={user} />} />
                  <Route path="/leave-requests" element={<LeaveRequests user={user} />} />
                  <Route path="/users" element={<ProtectedRoute adminOnly><Users user={user} /></ProtectedRoute>} />
                  <Route path="/security" element={<ProtectedRoute adminOnly><SecurityManagement user={user} /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute adminOnly><Admin user={user} /></ProtectedRoute>} />
                  <Route path="/profile" element={<Profile user={user} />} />
                  <Route path="/logs" element={<ProtectedRoute adminOnly><AuditLogs user={user} /></ProtectedRoute>} />
                  <Route path="/alerts" element={<ProtectedRoute adminOnly><Alerts user={user} /></ProtectedRoute>} />
                  <Route path="/backups" element={<ProtectedRoute adminOnly><Backups user={user} /></ProtectedRoute>} />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
