import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import type { PageResponse, RequestLog } from '../types';
import { MethodBadge } from '../components/MethodBadge';
import { StatusBadge } from '../components/StatusBadge';
import { RefreshIcon, AlertCircleIcon } from '../components/icons';

export const RequestsPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [data, setData] = useState<PageResponse<RequestLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [method, setMethod] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [endpointId, setEndpointId] = useState<string>(searchParams.get('endpointId') || '');
  const [page, setPage] = useState(0);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = status.trim() ? parseInt(status.trim(), 10) : undefined;
      const epParam = endpointId.trim() ? parseInt(endpointId.trim(), 10) : undefined;

      const res = await apiService.getRequests({
        method: method || undefined,
        status: statusParam,
        endpointId: epParam,
        page,
        size: 20,
      });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load request history from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, method, status, endpointId]);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="pb-4 border-b border-border-neutral flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-content-main">Request History</h1>
          <p className="text-content-muted mt-1">
            Historical audit logs of simulated incoming traffic persisted in MySQL.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border border-border-neutral bg-bg-surface hover:bg-bg-hover text-content-main transition-colors"
        >
          <RefreshIcon size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded border border-rose-900/60 bg-rose-950/20 text-rose-300 flex items-center space-x-2">
          <AlertCircleIcon size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Row */}
      <div className="p-3 rounded border border-border-neutral bg-bg-surface flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
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

          <input
            type="number"
            placeholder="Status code (e.g. 200)"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            className="w-40 px-2.5 py-1.5 bg-bg-sidebar border border-border-neutral rounded text-content-main outline-none focus:border-border-focus"
          />

          <input
            type="number"
            placeholder="Endpoint ID"
            value={endpointId}
            onChange={(e) => {
              setEndpointId(e.target.value);
              setPage(0);
            }}
            className="w-36 px-2.5 py-1.5 bg-bg-sidebar border border-border-neutral rounded text-content-main outline-none focus:border-border-focus"
          />
        </div>

        {(method || status || endpointId) && (
          <button
            onClick={() => {
              setMethod('');
              setStatus('');
              setEndpointId('');
              setPage(0);
            }}
            className="text-xs text-accent hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Requests Table */}
      <div className="border border-border-neutral rounded bg-bg-surface overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-content-faint">
            Loading request history from database...
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="p-12 text-center text-content-faint space-y-2">
            <p>No request logs found.</p>
            <p className="text-[11px] text-content-muted">
              Dispatch requests to <code className="text-accent">/mock/**</code> using the API Tester or curl to generate logs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-bg-sidebar/50 text-content-muted border-b border-border-neutral">
                <tr>
                  <th className="py-2.5 px-4 font-normal">Timestamp</th>
                  <th className="py-2.5 px-4 font-normal">Method</th>
                  <th className="py-2.5 px-4 font-normal">Request Path</th>
                  <th className="py-2.5 px-4 font-normal">Matched Endpoint</th>
                  <th className="py-2.5 px-4 font-normal">Status</th>
                  <th className="py-2.5 px-4 font-normal">Duration</th>
                  <th className="py-2.5 px-4 font-normal">Outcome</th>
                  <th className="py-2.5 px-4 font-normal text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {data.content.map((log) => (
                  <tr key={log.id} className="hover:bg-bg-hover/50 transition-colors">
                    <td className="py-3 px-4 text-content-muted">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <MethodBadge method={log.httpMethod} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-content-main font-medium truncate max-w-xs">
                      {log.requestPath}
                    </td>
                    <td className="py-3 px-4 text-content-muted truncate max-w-[140px]">
                      {log.endpointName ? (
                        <Link to={`/endpoints/${log.endpointId}`} className="hover:text-accent">
                          {log.endpointName}
                        </Link>
                      ) : (
                        <span className="text-content-faint italic">Unmatched</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={log.responseStatus} />
                    </td>
                    <td className="py-3 px-4 text-content-muted">{log.durationMs}ms</td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          log.outcome === 'SUCCESS'
                            ? 'text-emerald-400'
                            : log.outcome === 'NOT_FOUND'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }
                      >
                        {log.outcome}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/requests/${log.id}`} className="text-accent hover:underline">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {data && data.totalPages > 1 && (
          <div className="p-3 border-t border-border-neutral flex items-center justify-between text-content-muted bg-bg-sidebar/50">
            <span>
              Page {data.pageNumber + 1} of {data.totalPages} ({data.totalElements} records)
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                className="px-2.5 py-1 rounded border border-border-neutral bg-bg-surface hover:bg-bg-hover disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={data.isLast}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1 rounded border border-border-neutral bg-bg-surface hover:bg-bg-hover disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
