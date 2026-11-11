import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { MockEndpoint, RequestLog, EndpointStats } from '../types';
import { MethodBadge } from '../components/MethodBadge';
import { StatusBadge } from '../components/StatusBadge';
import {
  CopyIcon,
  CheckIcon,
  EditIcon,
  TrashIcon,
  TesterIcon,
  RefreshIcon,
  AlertCircleIcon,
} from '../components/icons';

export const EndpointDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [endpoint, setEndpoint] = useState<MockEndpoint | null>(null);
  const [stats, setStats] = useState<EndpointStats | null>(null);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const endpointId = id ? parseInt(id, 10) : 0;

  const loadData = async () => {
    if (!endpointId) return;
    setLoading(true);
    setError(null);
    try {
      const [epData, statsData, logsData] = await Promise.all([
        apiService.getEndpoint(endpointId),
        apiService.getEndpointStats(endpointId).catch(() => null),
        apiService.getRequests({ endpointId, size: 5 }).catch(() => null),
      ]);
      setEndpoint(epData);
      setStats(statsData);
      setLogs(logsData?.content || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load endpoint details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [endpointId]);

  const handleCopyUrl = () => {
    if (!endpoint) return;
    navigator.clipboard.writeText(endpoint.mockUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = async () => {
    if (!endpoint) return;
    try {
      const updated = await apiService.toggleEndpoint(endpoint.id, !endpoint.enabled);
      setEndpoint(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async () => {
    if (!endpoint) return;
    setIsDeleting(true);
    try {
      await apiService.deleteEndpoint(endpoint.id);
      navigate('/endpoints');
    } catch (err: any) {
      setError(err.message || 'Failed to delete endpoint');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-content-faint">
        Loading endpoint configuration...
      </div>
    );
  }

  if (error || !endpoint) {
    return (
      <div className="p-6 rounded border border-rose-900/60 bg-rose-950/20 text-rose-300 text-xs font-mono space-y-3">
        <div className="flex items-center space-x-2">
          <AlertCircleIcon size={16} />
          <span>{error || 'Endpoint not found'}</span>
        </div>
        <Link to="/endpoints" className="inline-block text-accent hover:underline">
          Return to Mock Endpoints
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Header */}
      <div className="pb-4 border-b border-border-neutral flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <MethodBadge method={endpoint.httpMethod} />
            <h1 className="text-lg font-semibold text-content-main">{endpoint.path}</h1>
            <span
              className={`px-2 py-0.5 rounded text-[11px] border ${
                endpoint.enabled
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60'
                  : 'bg-gray-800 text-gray-400 border-gray-700'
              }`}
            >
              {endpoint.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <p className="text-content-muted mt-1">{endpoint.name}</p>
          {endpoint.description && (
            <p className="text-content-faint mt-0.5">{endpoint.description}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            className="p-2 rounded border border-border-neutral bg-bg-surface hover:bg-bg-hover text-content-muted hover:text-content-main"
            title="Refresh details"
          >
            <RefreshIcon size={14} />
          </button>
          <button
            onClick={handleToggle}
            className="px-3 py-1.5 rounded border border-border-neutral bg-bg-surface hover:bg-bg-hover text-content-main"
          >
            {endpoint.enabled ? 'Disable' : 'Enable'}
          </button>
          <Link
            to={`/api-tester?url=${encodeURIComponent(endpoint.mockUrl)}&method=${endpoint.httpMethod}`}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-accent/20 border border-accent/40 hover:bg-accent/30 text-accent font-medium"
          >
            <TesterIcon size={13} />
            <span>Test Endpoint</span>
          </Link>
          <Link
            to={`/endpoints/${endpoint.id}/edit`}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border border-border-neutral bg-bg-surface hover:bg-bg-hover text-content-main"
          >
            <EditIcon size={13} />
            <span>Edit</span>
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded border border-border-neutral bg-bg-surface hover:border-rose-900 hover:text-rose-400 text-content-muted"
            title="Delete endpoint"
          >
            <TrashIcon size={14} />
          </button>
        </div>
      </div>

      {/* Mock URL Banner */}
      <div className="p-4 rounded border border-border-neutral bg-bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-content-muted text-[11px]">Live Simulation Endpoint URL</span>
          <div className="text-accent text-sm font-medium select-all break-all">
            {endpoint.mockUrl}
          </div>
        </div>
        <button
          onClick={handleCopyUrl}
          className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded border border-border-neutral bg-bg-sidebar hover:bg-bg-hover text-content-main shrink-0"
        >
          {copied ? (
            <>
              <CheckIcon size={14} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <CopyIcon size={14} />
              <span>Copy URL</span>
            </>
          )}
        </button>
      </div>

      {/* Grid: Config Details & Response Payload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 span): Metadata & Stats */}
        <div className="space-y-6">
          <div className="border border-border-neutral rounded bg-bg-surface p-4 space-y-3">
            <h3 className="font-semibold text-content-main pb-2 border-b border-border-neutral">
              Configuration Summary
            </h3>
            <div className="space-y-2 text-content-muted">
              <div className="flex justify-between">
                <span>Response Status</span>
                <StatusBadge status={endpoint.statusCode} />
              </div>
              <div className="flex justify-between">
                <span>Configured Delay</span>
                <span className="text-content-main">{endpoint.delayMs}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Total Recorded Traffic</span>
                <span className="text-content-main">{stats?.totalRequests ?? endpoint.requestCount} hits</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border-subtle text-[11px] text-content-faint">
                <span>Created</span>
                <span>{new Date(endpoint.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-content-faint">
                <span>Last Updated</span>
                <span>{new Date(endpoint.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Configured Response Headers */}
          <div className="border border-border-neutral rounded bg-bg-surface p-4 space-y-2">
            <h3 className="font-semibold text-content-main pb-2 border-b border-border-neutral">
              Configured Headers
            </h3>
            {endpoint.responseHeaders && endpoint.responseHeaders.trim() ? (
              <pre className="p-2.5 rounded bg-bg-sidebar text-content-muted text-[11px] overflow-x-auto">
                {endpoint.responseHeaders}
              </pre>
            ) : (
              <p className="text-content-faint italic py-2">
                No custom headers configured. Standard Content-Type headers are automatically attached.
              </p>
            )}
          </div>
        </div>

        {/* Right Column (2 spans): Response Payload & Recent Endpoint Traffic */}
        <div className="lg:col-span-2 space-y-6">
          {/* Response Payload */}
          <div className="border border-border-neutral rounded bg-bg-surface overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border-neutral flex items-center justify-between text-content-muted">
              <span className="font-medium text-content-main">Predefined Response Payload</span>
              <span>Status: {endpoint.statusCode}</span>
            </div>
            <pre className="p-4 bg-bg-sidebar text-content-main font-mono text-xs leading-relaxed overflow-x-auto max-h-[380px]">
              {endpoint.responseBody || '(Empty response body)'}
            </pre>
          </div>

          {/* Recent Endpoint Invocations */}
          <div className="border border-border-neutral rounded bg-bg-surface overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border-neutral flex items-center justify-between text-content-muted">
              <span className="font-medium text-content-main">Recent Invocations for This Route</span>
              <Link to={`/requests?endpointId=${endpoint.id}`} className="text-accent hover:underline">
                View all traffic
              </Link>
            </div>
            {logs.length === 0 ? (
              <div className="p-6 text-center text-content-faint">
                No requests have been dispatched to this endpoint yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-bg-sidebar/50 text-content-muted border-b border-border-neutral">
                    <tr>
                      <th className="py-2 px-4 font-normal">Timestamp</th>
                      <th className="py-2 px-4 font-normal">Status</th>
                      <th className="py-2 px-4 font-normal">Duration</th>
                      <th className="py-2 px-4 font-normal">Outcome</th>
                      <th className="py-2 px-4 font-normal text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-bg-hover/50">
                        <td className="py-2 px-4 text-content-muted">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2 px-4">
                          <StatusBadge status={log.responseStatus} />
                        </td>
                        <td className="py-2 px-4 text-content-muted">{log.durationMs}ms</td>
                        <td className="py-2 px-4">
                          <span
                            className={
                              log.outcome === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'
                            }
                          >
                            {log.outcome}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-right">
                          <Link to={`/requests/${log.id}`} className="text-accent hover:underline">
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
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded border border-border-neutral bg-bg-surface p-5 space-y-4">
            <h3 className="text-sm font-semibold text-content-main">Delete Endpoint</h3>
            <p className="text-content-muted">
              Are you sure you want to delete mock endpoint <code className="text-accent">{endpoint.path}</code>? All subsequent requests will return 404 Not Found.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-1.5 rounded border border-border-neutral bg-bg-sidebar hover:bg-bg-hover text-content-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-3 py-1.5 rounded border border-rose-900 bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-medium"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
