import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { DashboardStats } from '../types';
import { MethodBadge } from '../components/MethodBadge';
import { StatusBadge } from '../components/StatusBadge';
import {
  PlusIcon,
  TesterIcon,
  RefreshIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  EndpointsIcon,
} from '../components/icons';

export const OverviewPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getOverviewStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard statistics from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-xl font-mono font-semibold text-content-main">System Overview</h1>
          <p className="text-xs text-content-muted mt-1">
            Real-time mock endpoint metrics and simulated traffic activity.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border border-border-neutral bg-bg-surface hover:bg-bg-hover text-content-main text-xs font-mono transition-colors"
          >
            <RefreshIcon size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link
            to="/endpoints/new"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-accent/20 border border-accent/40 hover:bg-accent/30 text-accent text-xs font-mono transition-colors font-medium"
          >
            <PlusIcon size={13} />
            <span>Create Endpoint</span>
          </Link>
          <Link
            to="/api-tester"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border border-border-neutral bg-bg-surface hover:bg-bg-hover text-content-main text-xs font-mono transition-colors"
          >
            <TesterIcon size={13} />
            <span>API Tester</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded border border-rose-900/60 bg-rose-950/20 text-rose-300 text-xs font-mono flex items-center space-x-2">
          <AlertCircleIcon size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row (4 operational tiles, dense technical layout) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded border border-border-neutral bg-bg-surface">
          <div className="flex items-center justify-between text-xs text-content-muted font-mono">
            <span>Total Endpoints</span>
            <EndpointsIcon size={14} className="text-content-faint" />
          </div>
          <div className="mt-2 text-2xl font-mono font-semibold text-content-main">
            {loading ? '...' : stats?.totalEndpoints ?? 0}
          </div>
          <div className="mt-1 text-[11px] font-mono text-content-faint">
            {stats?.activeEndpoints ?? 0} enabled, {stats?.inactiveEndpoints ?? 0} disabled
          </div>
        </div>

        <div className="p-4 rounded border border-border-neutral bg-bg-surface">
          <div className="flex items-center justify-between text-xs text-content-muted font-mono">
            <span>Total Traffic</span>
            <ClockIcon size={14} className="text-content-faint" />
          </div>
          <div className="mt-2 text-2xl font-mono font-semibold text-content-main">
            {loading ? '...' : stats?.totalRequests ?? 0}
          </div>
          <div className="mt-1 text-[11px] font-mono text-content-faint">
            Recorded in MySQL request logs
          </div>
        </div>

        <div className="p-4 rounded border border-border-neutral bg-bg-surface">
          <div className="flex items-center justify-between text-xs text-content-muted font-mono">
            <span>Successful (2xx)</span>
            <CheckCircleIcon size={14} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-semibold text-emerald-400">
            {loading ? '...' : stats?.successfulRequests ?? 0}
          </div>
          <div className="mt-1 text-[11px] font-mono text-content-faint">
            {stats && stats.totalRequests > 0
              ? `${Math.round((stats.successfulRequests / stats.totalRequests) * 100)}% success rate`
              : 'No traffic recorded yet'}
          </div>
        </div>

        <div className="p-4 rounded border border-border-neutral bg-bg-surface">
          <div className="flex items-center justify-between text-xs text-content-muted font-mono">
            <span>Failed (4xx/5xx)</span>
            <AlertCircleIcon size={14} className="text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-mono font-semibold text-rose-400">
            {loading ? '...' : stats?.failedRequests ?? 0}
          </div>
          <div className="mt-1 text-[11px] font-mono text-content-faint">
            Errors simulated or route misses
          </div>
        </div>
      </div>

      {/* Main Grid: Status Distribution & Recent Endpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Recent Endpoints & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recently Configured Endpoints */}
          <div className="border border-border-neutral rounded bg-bg-surface overflow-hidden">
            <div className="px-4 py-3 border-b border-border-neutral flex items-center justify-between">
              <span className="font-mono text-xs font-medium text-content-main">
                Configured Mock Endpoints
              </span>
              <Link to="/endpoints" className="text-xs font-mono text-accent hover:underline">
                View all ({stats?.totalEndpoints ?? 0})
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs font-mono text-content-faint">
                Loading endpoints from database...
              </div>
            ) : !stats?.recentEndpoints || stats.recentEndpoints.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs font-mono text-content-muted">
                  No mock endpoints have been created yet.
                </p>
                <Link
                  to="/endpoints/new"
                  className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border border-border-neutral bg-bg-sidebar hover:bg-bg-hover text-xs font-mono text-accent"
                >
                  <PlusIcon size={12} />
                  <span>Create your first endpoint</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bg-sidebar/50 text-content-muted font-mono border-b border-border-neutral">
                    <tr>
                      <th className="py-2.5 px-4 font-normal">Method</th>
                      <th className="py-2.5 px-4 font-normal">Path</th>
                      <th className="py-2.5 px-4 font-normal">Status</th>
                      <th className="py-2.5 px-4 font-normal">Delay</th>
                      <th className="py-2.5 px-4 font-normal">Traffic</th>
                      <th className="py-2.5 px-4 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle font-mono">
                    {stats.recentEndpoints.map((ep) => (
                      <tr key={ep.id} className="hover:bg-bg-hover/50 transition-colors">
                        <td className="py-2.5 px-4">
                          <MethodBadge method={ep.httpMethod} size="sm" />
                        </td>
                        <td className="py-2.5 px-4 text-content-main font-mono truncate max-w-xs">
                          <Link to={`/endpoints/${ep.id}`} className="hover:text-accent">
                            {ep.path}
                          </Link>
                        </td>
                        <td className="py-2.5 px-4">
                          <StatusBadge status={ep.statusCode} />
                        </td>
                        <td className="py-2.5 px-4 text-content-muted">
                          {ep.delayMs > 0 ? `${ep.delayMs}ms` : 'None'}
                        </td>
                        <td className="py-2.5 px-4 text-content-muted">
                          {ep.requestCount} hits
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <Link
                            to={`/endpoints/${ep.id}`}
                            className="text-xs text-accent hover:underline mr-3"
                          >
                            Details
                          </Link>
                          <Link
                            to={`/api-tester?url=${encodeURIComponent(ep.mockUrl)}&method=${ep.httpMethod}`}
                            className="text-xs text-content-muted hover:text-content-main"
                          >
                            Test
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Request Traffic */}
          <div className="border border-border-neutral rounded bg-bg-surface overflow-hidden">
            <div className="px-4 py-3 border-b border-border-neutral flex items-center justify-between">
              <span className="font-mono text-xs font-medium text-content-main">
                Recent Request Invocations
              </span>
              <Link to="/requests" className="text-xs font-mono text-accent hover:underline">
                Full request history
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs font-mono text-content-faint">
                Loading request logs...
              </div>
            ) : !stats?.recentRequests || stats.recentRequests.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-content-faint">
                No mock requests recorded yet. Send a request to a mock URL to see real logs here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bg-sidebar/50 text-content-muted font-mono border-b border-border-neutral">
                    <tr>
                      <th className="py-2.5 px-4 font-normal">Method</th>
                      <th className="py-2.5 px-4 font-normal">Path</th>
                      <th className="py-2.5 px-4 font-normal">Status</th>
                      <th className="py-2.5 px-4 font-normal">Duration</th>
                      <th className="py-2.5 px-4 font-normal">Outcome</th>
                      <th className="py-2.5 px-4 font-normal text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle font-mono">
                    {stats.recentRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-bg-hover/50 transition-colors">
                        <td className="py-2 px-4">
                          <MethodBadge method={req.httpMethod} size="sm" />
                        </td>
                        <td className="py-2 px-4 text-content-main truncate max-w-xs">
                          {req.requestPath}
                        </td>
                        <td className="py-2 px-4">
                          <StatusBadge status={req.responseStatus} />
                        </td>
                        <td className="py-2 px-4 text-content-muted">
                          {req.durationMs}ms
                        </td>
                        <td className="py-2 px-4 text-[11px]">
                          <span
                            className={
                              req.outcome === 'SUCCESS'
                                ? 'text-emerald-400'
                                : req.outcome === 'NOT_FOUND'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }
                          >
                            {req.outcome}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-right">
                          <Link to={`/requests/${req.id}`} className="text-accent hover:underline text-xs">
                            Inspect
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Status Code Breakdown & Quick Reference */}
        <div className="space-y-6">
          <div className="border border-border-neutral rounded bg-bg-surface p-4">
            <h3 className="font-mono text-xs font-semibold text-content-main pb-2 border-b border-border-neutral">
              HTTP Response Distribution
            </h3>

            {loading ? (
              <div className="py-6 text-center text-xs font-mono text-content-faint">
                Loading status distribution...
              </div>
            ) : !stats?.statusCodeDistribution || Object.keys(stats.statusCodeDistribution).length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-content-faint">
                No response data recorded yet.
              </div>
            ) : (
              <div className="mt-3 space-y-2 font-mono text-xs">
                {Object.entries(stats.statusCodeDistribution).map(([statusCode, count]) => {
                  const codeNum = parseInt(statusCode, 10);
                  const total = stats.totalRequests > 0 ? stats.totalRequests : 1;
                  const percentage = Math.round((count / total) * 100);

                  return (
                    <div key={statusCode} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={codeNum} />
                          <span className="text-content-muted">{count} calls</span>
                        </div>
                        <span className="text-content-faint">{percentage}%</span>
                      </div>
                      <div className="w-full bg-bg-sidebar rounded h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${
                            codeNum < 300
                              ? 'bg-emerald-400'
                              : codeNum < 400
                              ? 'bg-blue-400'
                              : codeNum < 500
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border border-border-neutral rounded bg-bg-surface p-4 text-xs font-mono space-y-3">
            <h3 className="font-semibold text-content-main pb-2 border-b border-border-neutral">
              Mock Engine Integration
            </h3>
            <p className="text-content-muted leading-relaxed">
              Route structure mounts dynamic endpoints under <code className="text-accent">/mock/**</code>.
            </p>
            <div className="p-2.5 rounded bg-bg-sidebar border border-border-neutral text-[11px] text-content-faint space-y-1">
              <div>Base URL: http://localhost:8080</div>
              <div>Route Path: /api/products</div>
              <div className="text-accent truncate">Live URL: http://localhost:8080/mock/api/products</div>
            </div>
            <p className="text-content-faint text-[11px] leading-relaxed">
              Supports GET, POST, PUT, PATCH, and DELETE. Changes take effect immediately without restarting the Java server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
