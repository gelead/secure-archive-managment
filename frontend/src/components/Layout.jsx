import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  FileText,
  Users,
  Settings,
  User,
  Activity,
  Bell,
  Database,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

const Layout = ({ user, onLogout, children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'MANAGER', 'STAFF', 'HR', 'IT'] },
    { path: '/files', icon: FileText, label: 'Files', roles: ['ADMIN', 'MANAGER', 'STAFF', 'HR', 'IT'] },
    { path: '/role-requests', icon: Users, label: 'Role Requests', roles: ['ADMIN', 'MANAGER', 'STAFF', 'HR', 'IT'] },
    { path: '/users', icon: Users, label: 'Users', roles: ['ADMIN'] },
    { path: '/security', icon: Shield, label: 'Security', roles: ['ADMIN'] },
    { path: '/admin', icon: Settings, label: 'Admin', roles: ['ADMIN'] },
    { path: '/logs', icon: Activity, label: 'Audit Logs', roles: ['ADMIN'] },
    { path: '/alerts', icon: Bell, label: 'Alerts', roles: ['ADMIN'] },
    { path: '/backups', icon: Database, label: 'Backups', roles: ['ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  const NavLink = ({ item }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    
    return (
      <Link
        to={item.path}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-slate-400 hover:bg-slate-700 hover:text-white'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 flex items-center space-x-2 border-b border-slate-700">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-white text-lg">SecureArchive</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700 space-y-2">
          <Link
            to="/profile"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === '/profile'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Profile</span>
          </Link>
          
          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-slate-700/50">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.username}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;

