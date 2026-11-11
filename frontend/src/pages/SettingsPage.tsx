import React, { useState, useEffect } from 'react';
import { apiService, API_BASE_URL } from '../services/api';
import type { HealthStatus } from '../types';
import { RefreshIcon, AlertCircleIcon } from '../components/icons';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getHealth();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'Unable to communicate with the backend health endpoint');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="pb-4 border-b border-border-neutral flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-content-main">System Settings and Health</h1>
          <p className="text-content-muted mt-1">
            Inspection of runtime components, database connectivity, and configuration variables.
          </p>
        </div>
        <button
          onClick={checkHealth}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border border-border-neutral bg-bg-surface hover:bg-bg-hover text-content-main transition-colors"
        >
          <RefreshIcon size={13} className={loading ? 'animate-spin' : ''} />
          <span>Ping Health</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded border border-rose-900/60 bg-rose-950/20 text-rose-300 flex items-center space-x-2">
          <AlertCircleIcon size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Connectivity Status Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded border border-border-neutral bg-bg-surface space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-content-muted">Frontend Client</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="text-lg font-semibold text-content-main">Active</div>
          <p className="text-[11px] text-content-faint">React 19, TypeScript, Vite</p>
        </div>

        <div className="p-4 rounded border border-border-neutral bg-bg-surface space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-content-muted">Java Backend</span>
            <span
              className={`w-2 h-2 rounded-full ${
                health?.status === 'UP' ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
          </div>
          <div className="text-lg font-semibold text-content-main">
            {health?.status === 'UP' ? 'Online' : 'Disconnected'}
          </div>
          <p className="text-[11px] text-content-faint">
            Spring Boot 3.3.4 (Java 21 LTS)
          </p>
        </div>

        <div className="p-4 rounded border border-border-neutral bg-bg-surface space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-content-muted">MySQL Database</span>
            <span
              className={`w-2 h-2 rounded-full ${
                health?.database?.status === 'CONNECTED' ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
          </div>
          <div className="text-lg font-semibold text-content-main">
            {health?.database?.status || 'Unknown'}
          </div>
          <p className="text-[11px] text-content-faint">
            {health?.database?.databaseProductName || 'MySQL'} {health?.database?.databaseProductVersion || '8.x'}
          </p>
        </div>
      </div>

      {/* Environment & Configuration Table */}
      <div className="border border-border-neutral rounded bg-bg-surface p-5 space-y-4">
        <h2 className="text-sm font-semibold text-content-main pb-2 border-b border-border-neutral">
          Application Configuration
        </h2>

        <div className="space-y-3 text-content-muted">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-border-subtle gap-1">
            <span className="text-content-main">API Base URL</span>
            <code className="text-accent">{API_BASE_URL}</code>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-border-subtle gap-1">
            <span className="text-content-main">Mock Engine Root</span>
            <code className="text-accent">{API_BASE_URL}/mock/**</code>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-border-subtle gap-1">
            <span className="text-content-main">Application Version</span>
            <span className="text-content-main">{health?.version || '1.0.0'}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-border-subtle gap-1">
            <span className="text-content-main">Visual Aesthetic</span>
            <span className="text-content-main">Restrained Dark Developer Dashboard</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-border-subtle gap-1">
            <span className="text-content-main">Request History Retention</span>
            <span className="text-content-main">Persistent MySQL Records (request_logs table)</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 gap-1">
            <span className="text-content-main">Security Sanitization</span>
            <span className="text-emerald-400">
              Active (Authorization, Cookie, and Set-Cookie redacted)
            </span>
          </div>
        </div>
      </div>

      {/* Database Schema Information */}
      <div className="border border-border-neutral rounded bg-bg-surface p-5 space-y-3">
        <h2 className="text-sm font-semibold text-content-main pb-2 border-b border-border-neutral">
          Database Schema Status
        </h2>
        <div className="text-content-muted space-y-2 leading-relaxed">
          <p>
            Flyway database migrations manage the MySQL relational schema:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-content-faint">
            <li>
              <code className="text-content-main">V1__create_mock_endpoints_table.sql</code>: Configured mock routes, status codes, bodies, and delays.
            </li>
            <li>
              <code className="text-content-main">V2__create_request_logs_table.sql</code>: Historical audit trail of all incoming simulated requests with timing metrics.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
