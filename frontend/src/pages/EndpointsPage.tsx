import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { HttpMethod, MockEndpoint, PageResponse } from '../types';
import { MethodBadge } from '../components/MethodBadge';
import { StatusBadge } from '../components/StatusBadge';
import {
  PlusIcon,
  SearchIcon,
  RefreshIcon,
  CopyIcon,
  CheckIcon,
  EditIcon,
  TrashIcon,
  TesterIcon,
  AlertCircleIcon,
} from '../components/icons';

export const EndpointsPage: React.FC = () => {
  const [data, setData] = useState<PageResponse<MockEndpoint> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState<HttpMethod | ''>('');
  const [enabled, setEnabled] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEndpoints = async () => {
    setLoading(true);
    setError(null);
    try {
      const enabledParam = enabled === 'all' ? undefined : enabled === 'true';
      const methodParam = method === '' ? undefined : (method as HttpMethod);
      const res = await apiService.getEndpoints({
        search: search.trim() || undefined,
        method: methodParam,
        enabled: enabledParam,
        page,
        size: 15,
      });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load endpoints from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEndpoints();
  }, [page, method, enabled]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchEndpoints();
  };

  const handleCopyUrl = (id: number, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggle = async (id: number, currentEnabled: boolean) => {
    try {
      await apiService.toggleEndpoint(id, !currentEnabled);
      fetchEndpoints();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle endpoint status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await apiService.deleteEndpoint(deleteId);
      setDeleteId(null);
      fetchEndpoints();
    } catch (err: any) {
      setError(err.message || 'Failed to delete endpoint');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-neutral">
        <div>
          <h1 className="text-xl font-mono font-semibold text-content-main">Mock Endpoints</h1>
          <p className="text-xs text-content-muted mt-1">
            Configure dynamic HTTP simulation routes, response codes, headers, and delays.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchEndpoints}
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
        </div>
      </div>

      {error && (
        <div className="p-4 rounded border border-rose-900/60 bg-rose-950/20 text-rose-300 text-xs font-mono flex items-center space-x-2">
          <AlertCircleIcon size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-3 rounded border border-border-neutral bg-bg-surface flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:w-auto flex items-center space-x-2">
          <div className="relative flex-1">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-faint" />
            <input
              type="text"
              placeholder="Filter by endpoint name or path..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-bg-sidebar border border-border-neutral rounded text-xs font-mono text-content-main outline-none focus:border-border-focus"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded border border-border-neutral bg-bg-sidebar hover:bg-bg-hover text-xs font-mono text-content-main"
          >
            Filter
          </button>
        </form>

        <div className="flex items-center space-x-2 w-full md:w-auto text-xs font-mono">
          <select
            value={method}
            onChange={(e) => {
              setMethod(e.target.value as HttpMethod | '');
              setPage(0);
            }}
            className="px-2.5 py-1.5 bg-bg-sidebar border border-border-neutral rounded text-content-main outline-none focus:border-border-focus"
          >
            <option value="">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>

          <select
            value={enabled}
            onChange={(e) => {
              setEnabled(e.target.value);
              setPage(0);
            }}
            className="px-2.5 py-1.5 bg-bg-sidebar border border-border-neutral rounded text-content-main outline-none focus:border-border-focus"
          >
            <option value="all">All States</option>
            <option value="true">Enabled only</option>
            <option value="false">Disabled only</option>
          </select>
        </div>
      </div>

      {/* Endpoints Table */}
      <div className="border border-border-neutral rounded bg-bg-surface overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-content-faint">
            Loading endpoints...
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-xs font-mono text-content-muted">
              No matching mock endpoints found.
            </p>
            <Link
              to="/endpoints/new"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border border-border-neutral bg-bg-sidebar hover:bg-bg-hover text-xs font-mono text-accent"
            >
              <PlusIcon size={12} />
              <span>Create new endpoint</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-bg-sidebar/50 text-content-muted border-b border-border-neutral">
                <tr>
                  <th className="py-2.5 px-4 font-normal">Method</th>
                  <th className="py-2.5 px-4 font-normal">Endpoint Path</th>
                  <th className="py-2.5 px-4 font-normal">Name</th>
                  <th className="py-2.5 px-4 font-normal">Status</th>
                  <th className="py-2.5 px-4 font-normal">Delay</th>
                  <th className="py-2.5 px-4 font-normal">Active</th>
                  <th className="py-2.5 px-4 font-normal">Traffic</th>
                  <th className="py-2.5 px-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {data.content.map((ep) => (
                  <tr key={ep.id} className="hover:bg-bg-hover/50 transition-colors">
                    <td className="py-3 px-4">
                      <MethodBadge method={ep.httpMethod} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-content-main truncate max-w-xs">
                      <Link to={`/endpoints/${ep.id}`} className="hover:text-accent">
                        {ep.path}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-content-muted truncate max-w-[160px]">
                      {ep.name}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={ep.statusCode} />
                    </td>
                    <td className="py-3 px-4 text-content-muted">
                      {ep.delayMs > 0 ? `${ep.delayMs}ms` : '0ms'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggle(ep.id, ep.enabled)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors border ${
                          ep.enabled
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60 hover:bg-emerald-950/60'
                            : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                        }`}
                      >
                        {ep.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-content-muted">
                      {ep.requestCount} requests
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(ep.id, ep.mockUrl)}
                          className="p-1 rounded text-content-muted hover:text-content-main hover:bg-bg-hover transition-colors"
                          title="Copy mock URL"
                        >
                          {copiedId === ep.id ? (
                            <CheckIcon size={14} className="text-emerald-400" />
                          ) : (
                            <CopyIcon size={14} />
                          )}
                        </button>
                        <Link
                          to={`/api-tester?url=${encodeURIComponent(ep.mockUrl)}&method=${ep.httpMethod}`}
                          className="p-1 rounded text-content-muted hover:text-accent hover:bg-bg-hover transition-colors"
                          title="Test endpoint in API Tester"
                        >
                          <TesterIcon size={14} />
                        </Link>
                        <Link
                          to={`/endpoints/${ep.id}/edit`}
                          className="p-1 rounded text-content-muted hover:text-content-main hover:bg-bg-hover transition-colors"
                          title="Edit configuration"
                        >
                          <EditIcon size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteId(ep.id)}
                          className="p-1 rounded text-content-muted hover:text-rose-400 hover:bg-bg-hover transition-colors"
                          title="Delete endpoint"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {data && data.totalPages > 1 && (
          <div className="p-3 border-t border-border-neutral flex items-center justify-between text-xs font-mono text-content-muted bg-bg-sidebar/50">
            <span>
              Showing page {data.pageNumber + 1} of {data.totalPages} ({data.totalElements} items)
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                className="px-2.5 py-1 rounded border border-border-neutral bg-bg-surface hover:bg-bg-hover disabled:opacity-40 disabled:pointer-events-none"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={data.isLast}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1 rounded border border-border-neutral bg-bg-surface hover:bg-bg-hover disabled:opacity-40 disabled:pointer-events-none"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded border border-border-neutral bg-bg-surface p-5 space-y-4 font-mono text-xs">
            <h3 className="text-sm font-semibold text-content-main">Confirm Endpoint Deletion</h3>
            <p className="text-content-muted">
              Are you sure you want to delete mock endpoint ID {deleteId}? Incoming requests to this path will subsequently receive 404 Not Found.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteId(null)}
                className="px-3 py-1.5 rounded border border-border-neutral bg-bg-sidebar hover:bg-bg-hover text-content-muted hover:text-content-main"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-3 py-1.5 rounded border border-rose-900 bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-medium"
              >
                {isDeleting ? 'Deleting...' : 'Delete Endpoint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
