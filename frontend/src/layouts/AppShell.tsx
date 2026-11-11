import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  OverviewIcon,
  EndpointsIcon,
  RequestsIcon,
  TesterIcon,
  SettingsIcon,
  PlusIcon,
} from '../components/icons';
import { apiService } from '../services/api';
import type { HealthStatus } from '../types';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        const h = await apiService.getHealth();
        if (isMounted) {
          setHealth(h);
          setIsBackendHealthy(h.status === 'UP');
        }
      } catch {
        if (isMounted) {
          setIsBackendHealthy(false);
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { to: '/overview', label: 'Overview', icon: OverviewIcon },
    { to: '/endpoints', label: 'Mock Endpoints', icon: EndpointsIcon },
    { to: '/requests', label: 'Request History', icon: RequestsIcon },
    { to: '/api-tester', label: 'API Tester', icon: TesterIcon },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.startsWith('/overview')) return 'Overview';
    if (path === '/endpoints/new') return 'Mock Endpoints / New Endpoint';
    if (path.includes('/edit')) return 'Mock Endpoints / Edit';
    if (path.startsWith('/endpoints/')) return 'Mock Endpoints / Endpoint Details';
    if (path.startsWith('/endpoints')) return 'Mock Endpoints';
    if (path.startsWith('/requests/')) return 'Request History / Log Details';
    if (path.startsWith('/requests')) return 'Request History';
    if (path.startsWith('/api-tester')) return 'API Tester';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-bg-main text-content-main overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-sidebar border-r border-border-neutral flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Logo & Branding */}
          <div className="px-5 py-4 border-b border-border-neutral">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded bg-accent/20 border border-accent/40 flex items-center justify-center font-mono font-bold text-accent text-xs">
                E
              </div>
              <span className="font-mono text-base font-semibold tracking-wider text-content-main">
                EXORA
              </span>
            </div>
            <p className="mt-1 text-[11px] font-mono text-content-faint tracking-tight">
              Build. Simulate. Test.
            </p>
          </div>

          {/* Quick Action */}
          <div className="px-3 pt-4 pb-2">
            <NavLink
              to="/endpoints/new"
              className="flex items-center justify-center space-x-2 w-full py-2 px-3 rounded border border-border-neutral bg-bg-surface hover:bg-bg-hover hover:border-accent text-xs font-mono text-content-main transition-colors"
            >
              <PlusIcon size={14} />
              <span>Create Endpoint</span>
            </NavLink>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded text-xs transition-colors ${
                      isActive
                        ? 'bg-bg-surface text-content-main border border-border-neutral font-medium'
                        : 'text-content-muted hover:text-content-main hover:bg-bg-hover'
                    }`
                  }
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* System Health Status Footer */}
        <div className="p-4 border-t border-border-neutral bg-bg-surface/50 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-content-muted text-[11px] font-mono">Backend Engine</span>
            <div className="flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isBackendHealthy === true
                    ? 'bg-emerald-400'
                    : isBackendHealthy === false
                    ? 'bg-rose-400'
                    : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span className="font-mono text-[11px] text-content-muted">
                {isBackendHealthy === true ? 'Online' : isBackendHealthy === false ? 'Offline' : 'Checking'}
              </span>
            </div>
          </div>
          {health?.database && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-subtle text-[11px] text-content-faint font-mono">
              <span>MySQL 8.0</span>
              <span className={health.database.status === 'CONNECTED' ? 'text-emerald-400' : 'text-rose-400'}>
                {health.database.status}
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-border-neutral bg-bg-sidebar px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-content-faint">App</span>
            <span className="text-content-faint">/</span>
            <span className="text-content-main font-medium">{getBreadcrumb()}</span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="px-2 py-1 rounded border border-border-neutral bg-bg-surface font-mono text-[11px] text-content-muted">
              API Base: http://localhost:8080
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 overflow-y-auto p-6 bg-bg-main">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
