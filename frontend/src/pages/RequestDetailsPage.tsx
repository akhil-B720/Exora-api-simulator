import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { RequestLog } from '../types';
import { MethodBadge } from '../components/MethodBadge';
import { StatusBadge } from '../components/StatusBadge';
import { AlertCircleIcon } from '../components/icons';

export const RequestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [log, setLog] = useState<RequestLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiService
      .getRequest(parseInt(id, 10))
      .then((data) => {
        setLog(data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch request log');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-content-faint">
        Loading request log details...
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="p-6 rounded border border-rose-900/60 bg-rose-950/20 text-rose-300 text-xs font-mono space-y-3">
        <div className="flex items-center space-x-2">
          <AlertCircleIcon size={16} />
          <span>{error || 'Request log not found'}</span>
        </div>
        <Link to="/requests" className="inline-block text-accent hover:underline">
          Return to Request History
        </Link>
      </div>
    );
  }

  let parsedMetadata: any = null;
  try {
    if (log.safeRequestMetadata) {
      parsedMetadata = JSON.parse(log.safeRequestMetadata);
    }
  } catch {
    parsedMetadata = null;
  }

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="pb-4 border-b border-border-neutral flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <MethodBadge method={log.httpMethod} />
            <h1 className="text-lg font-semibold text-content-main">{log.requestPath}</h1>
            <StatusBadge status={log.responseStatus} />
          </div>
          <p className="text-content-muted mt-1">
            Logged at {new Date(log.timestamp).toLocaleString()} (Execution duration: {log.durationMs}ms)
          </p>
        </div>
        <Link
          to="/requests"
          className="px-3 py-1.5 rounded border border-border-neutral bg-bg-surface hover:bg-bg-hover text-content-muted hover:text-content-main shrink-0"
        >
          Back to History
        </Link>
      </div>

      {log.errorSummary && (
        <div className="p-3 rounded border border-rose-900/60 bg-rose-950/20 text-rose-300 flex items-center space-x-2">
          <AlertCircleIcon size={14} />
          <span>Error Summary: {log.errorSummary}</span>
        </div>
      )}

      {/* Grid: Request Metadata & Response */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Incoming Request Information */}
        <div className="space-y-6">
          <div className="border border-border-neutral rounded bg-bg-surface p-4 space-y-3">
            <h3 className="font-semibold text-content-main pb-2 border-b border-border-neutral">
              Incoming Request Information
            </h3>
            <div className="space-y-2 text-content-muted">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="text-content-main">{log.httpMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Request Path</span>
                <span className="text-content-main">{log.requestPath}</span>
              </div>
              <div className="flex justify-between">
                <span>Matched Endpoint</span>
                <span className="text-content-main">
                  {log.endpointName ? (
                    <Link to={`/endpoints/${log.endpointId}`} className="text-accent hover:underline">
                      {log.endpointName}
                    </Link>
                  ) : (
                    'None (404 Route Miss)'
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Outcome</span>
                <span className="text-content-main">{log.outcome}</span>
              </div>
              {parsedMetadata?.queryString && (
                <div className="flex justify-between">
                  <span>Query String</span>
                  <span className="text-content-main">{parsedMetadata.queryString}</span>
                </div>
              )}
              {parsedMetadata?.remoteAddr && (
                <div className="flex justify-between">
                  <span>Client Address</span>
                  <span className="text-content-main">{parsedMetadata.remoteAddr}</span>
                </div>
              )}
            </div>
          </div>

          {/* Safe Request Headers */}
          <div className="border border-border-neutral rounded bg-bg-surface p-4 space-y-2">
            <h3 className="font-semibold text-content-main pb-2 border-b border-border-neutral">
              Sanitized Request Headers
            </h3>
            {parsedMetadata?.headers && Object.keys(parsedMetadata.headers).length > 0 ? (
              <pre className="p-3 rounded bg-bg-sidebar text-content-muted text-[11px] overflow-x-auto leading-relaxed">
                {JSON.stringify(parsedMetadata.headers, null, 2)}
              </pre>
            ) : (
              <p className="text-content-faint italic py-2">No request headers recorded.</p>
            )}
          </div>

          {/* Request Body */}
          <div className="border border-border-neutral rounded bg-bg-surface p-4 space-y-2">
            <h3 className="font-semibold text-content-main pb-2 border-b border-border-neutral">
              Incoming Request Body
            </h3>
            {log.requestBody && log.requestBody.trim() ? (
              <pre className="p-3 rounded bg-bg-sidebar text-content-main text-xs overflow-x-auto max-h-[260px] leading-relaxed">
                {log.requestBody}
              </pre>
            ) : (
              <p className="text-content-faint italic py-2">No request body provided with this call.</p>
            )}
          </div>
        </div>

        {/* Right Column: Outgoing Server Response */}
        <div className="space-y-6">
          <div className="border border-border-neutral rounded bg-bg-surface p-4 space-y-3">
            <h3 className="font-semibold text-content-main pb-2 border-b border-border-neutral">
              Dispatched Response Metadata
            </h3>
            <div className="space-y-2 text-content-muted">
              <div className="flex justify-between">
                <span>Status Code</span>
                <StatusBadge status={log.responseStatus} />
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="text-content-main">{log.durationMs}ms</span>
              </div>
            </div>
          </div>

          {/* Outgoing Headers */}
          <div className="border border-border-neutral rounded bg-bg-surface p-4 space-y-2">
            <h3 className="font-semibold text-content-main pb-2 border-b border-border-neutral">
              Dispatched Response Headers
            </h3>
            {log.responseHeaders && log.responseHeaders.trim() ? (
              <pre className="p-3 rounded bg-bg-sidebar text-content-muted text-[11px] overflow-x-auto leading-relaxed">
                {log.responseHeaders}
              </pre>
            ) : (
              <p className="text-content-faint italic py-2">Standard headers applied.</p>
            )}
          </div>

          {/* Response Body */}
          <div className="border border-border-neutral rounded bg-bg-surface p-4 space-y-2">
            <h3 className="font-semibold text-content-main pb-2 border-b border-border-neutral">
              Dispatched Response Body
            </h3>
            {log.responseBody && log.responseBody.trim() ? (
              <pre className="p-3 rounded bg-bg-sidebar text-content-main text-xs overflow-x-auto max-h-[320px] leading-relaxed">
                {log.responseBody}
              </pre>
            ) : (
              <p className="text-content-faint italic py-2">(Empty response body)</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
