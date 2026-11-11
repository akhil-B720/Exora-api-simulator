import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import type { HttpMethod } from '../types';
import { JsonEditor } from '../components/JsonEditor';
import { StatusBadge } from '../components/StatusBadge';
import { PlusIcon, TrashIcon, ClockIcon, AlertCircleIcon } from '../components/icons';

interface KeyVal {
  key: string;
  value: string;
}

export const ApiTesterPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('http://localhost:8080/mock/api/products');
  const [headers, setHeaders] = useState<KeyVal[]>([
    { key: 'Accept', value: 'application/json' },
  ]);
  const [queryParams, setQueryParams] = useState<KeyVal[]>([]);
  const [requestBody, setRequestBody] = useState('');
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('params');

  // Response state
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseStatusText, setResponseStatusText] = useState<string>('');
  const [responseDuration, setResponseDuration] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string> | null>(null);
  const [responseBody, setResponseBody] = useState<string | null>(null);
  const [responseError, setResponseError] = useState<string | null>(null);

  useEffect(() => {
    const paramUrl = searchParams.get('url');
    const paramMethod = searchParams.get('method');
    if (paramUrl) setUrl(paramUrl);
    if (paramMethod) setMethod(paramMethod.toUpperCase() as HttpMethod);
  }, [searchParams]);

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (idx: number) => {
    setHeaders(headers.filter((_, i) => i !== idx));
  };

  const handleHeaderChange = (idx: number, field: 'key' | 'value', val: string) => {
    const updated = [...headers];
    updated[idx][field] = val;
    setHeaders(updated);
  };

  const handleAddParam = () => {
    setQueryParams([...queryParams, { key: '', value: '' }]);
  };

  const handleRemoveParam = (idx: number) => {
    setQueryParams(queryParams.filter((_, i) => i !== idx));
  };

  const handleParamChange = (idx: number, field: 'key' | 'value', val: string) => {
    const updated = [...queryParams];
    updated[idx][field] = val;
    setQueryParams(updated);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setResponseError(null);
    setResponseStatus(null);
    setResponseBody(null);
    setResponseHeaders(null);

    // Build URL with query params
    let fullUrl = url.trim();
    const validParams = queryParams.filter((p) => p.key.trim());
    if (validParams.length > 0) {
      const urlObj = new URL(fullUrl.startsWith('http') ? fullUrl : `http://localhost:8080${fullUrl}`);
      validParams.forEach((p) => urlObj.searchParams.append(p.key.trim(), p.value));
      fullUrl = urlObj.toString();
    }

    // Build headers object
    const headersObj: Record<string, string> = {};
    headers.forEach((h) => {
      if (h.key.trim()) {
        headersObj[h.key.trim()] = h.value;
      }
    });

    try {
      const res = await apiService.executeLiveRequest(method, fullUrl, headersObj, requestBody);
      setResponseStatus(res.status);
      setResponseStatusText(res.statusText);
      setResponseDuration(res.durationMs);
      setResponseHeaders(res.headers);

      if (res.isJson) {
        try {
          const parsed = JSON.parse(res.body);
          setResponseBody(JSON.stringify(parsed, null, 2));
        } catch {
          setResponseBody(res.body);
        }
      } else {
        setResponseBody(res.body);
      }
    } catch (err: any) {
      setResponseError(err.message || 'Error occurred communicating with the server');
      if (err.data && err.data.durationMs) {
        setResponseDuration(err.data.durationMs);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="pb-4 border-b border-border-neutral flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-content-main">API Tester</h1>
          <p className="text-content-muted mt-1">
            Dispatch real HTTP requests to test mock endpoints and inspect live server responses.
          </p>
        </div>
      </div>

      {/* Request Bar */}
      <form onSubmit={handleSendRequest} className="space-y-4">
        <div className="flex items-center space-x-2 p-2 rounded border border-border-neutral bg-bg-surface">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className="bg-bg-sidebar border border-border-neutral rounded px-3 py-2 text-content-main font-semibold outline-none focus:border-border-focus"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>

          <input
            type="text"
            placeholder="http://localhost:8080/mock/api/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-bg-sidebar border border-border-neutral rounded px-3 py-2 text-content-main outline-none focus:border-border-focus"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded bg-accent/20 border border-accent/50 hover:bg-accent/30 text-accent font-semibold transition-colors disabled:opacity-50 shrink-0"
          >
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </div>

        {/* Request Tabs */}
        <div className="border border-border-neutral rounded bg-bg-surface overflow-hidden">
          <div className="flex border-b border-border-neutral bg-bg-sidebar/50 text-content-muted">
            <button
              type="button"
              onClick={() => setActiveTab('params')}
              className={`px-4 py-2 border-r border-border-neutral transition-colors ${
                activeTab === 'params'
                  ? 'bg-bg-surface text-content-main font-medium border-b-2 border-b-accent'
                  : 'hover:text-content-main'
              }`}
            >
              Query Parameters ({queryParams.filter((p) => p.key).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('headers')}
              className={`px-4 py-2 border-r border-border-neutral transition-colors ${
                activeTab === 'headers'
                  ? 'bg-bg-surface text-content-main font-medium border-b-2 border-b-accent'
                  : 'hover:text-content-main'
              }`}
            >
              Headers ({headers.filter((h) => h.key).length})
            </button>
            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <button
                type="button"
                onClick={() => setActiveTab('body')}
                className={`px-4 py-2 transition-colors ${
                  activeTab === 'body'
                    ? 'bg-bg-surface text-content-main font-medium border-b-2 border-b-accent'
                    : 'hover:text-content-main'
                }`}
              >
                Request Body
              </button>
            )}
          </div>

          <div className="p-4">
            {activeTab === 'params' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center pb-2">
                  <span className="text-content-muted">URL Query Parameters</span>
                  <button
                    type="button"
                    onClick={handleAddParam}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded border border-border-neutral bg-bg-sidebar hover:bg-bg-hover text-content-muted hover:text-content-main"
                  >
                    <PlusIcon size={12} />
                    <span>Add Parameter</span>
                  </button>
                </div>
                {queryParams.length === 0 ? (
                  <p className="text-content-faint italic py-2">No query parameters configured.</p>
                ) : (
                  queryParams.map((param, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Parameter Key"
                        value={param.key}
                        onChange={(e) => handleParamChange(idx, 'key', e.target.value)}
                        className="flex-1 bg-bg-sidebar border border-border-neutral rounded px-2.5 py-1 text-content-main outline-none focus:border-border-focus"
                      />
                      <input
                        type="text"
                        placeholder="Parameter Value"
                        value={param.value}
                        onChange={(e) => handleParamChange(idx, 'value', e.target.value)}
                        className="flex-1 bg-bg-sidebar border border-border-neutral rounded px-2.5 py-1 text-content-main outline-none focus:border-border-focus"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveParam(idx)}
                        className="p-1 rounded text-content-muted hover:text-rose-400 hover:bg-bg-hover"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'headers' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center pb-2">
                  <span className="text-content-muted">Custom Request Headers</span>
                  <button
                    type="button"
                    onClick={handleAddHeader}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded border border-border-neutral bg-bg-sidebar hover:bg-bg-hover text-content-muted hover:text-content-main"
                  >
                    <PlusIcon size={12} />
                    <span>Add Header</span>
                  </button>
                </div>
                {headers.length === 0 ? (
                  <p className="text-content-faint italic py-2">No custom headers configured.</p>
                ) : (
                  headers.map((hdr, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Header Key"
                        value={hdr.key}
                        onChange={(e) => handleHeaderChange(idx, 'key', e.target.value)}
                        className="flex-1 bg-bg-sidebar border border-border-neutral rounded px-2.5 py-1 text-content-main outline-none focus:border-border-focus"
                      />
                      <input
                        type="text"
                        placeholder="Header Value"
                        value={hdr.value}
                        onChange={(e) => handleHeaderChange(idx, 'value', e.target.value)}
                        className="flex-1 bg-bg-sidebar border border-border-neutral rounded px-2.5 py-1 text-content-main outline-none focus:border-border-focus"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveHeader(idx)}
                        className="p-1 rounded text-content-muted hover:text-rose-400 hover:bg-bg-hover"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'body' && (
              <div>
                <label className="block text-content-muted mb-1">Request Payload</label>
                <JsonEditor
                  value={requestBody}
                  onChange={setRequestBody}
                  height="160px"
                  placeholder="Enter JSON request body"
                />
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Response Panel */}
      <div className="border border-border-neutral rounded bg-bg-surface overflow-hidden">
        <div className="px-4 py-3 border-b border-border-neutral flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-bg-sidebar/50">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-content-main">Server Response</span>
            {responseStatus !== null && <StatusBadge status={responseStatus} />}
            {responseStatusText && (
              <span className="text-content-muted">{responseStatusText}</span>
            )}
          </div>
          {responseDuration !== null && (
            <div className="flex items-center space-x-1.5 text-content-faint">
              <ClockIcon size={13} />
              <span>Round-trip latency: {responseDuration}ms</span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          {loading && (
            <div className="py-12 text-center text-content-faint space-y-2">
              <div className="animate-pulse">Dispatching HTTP {method} request...</div>
              <p className="text-[11px] text-content-muted">Waiting for backend response</p>
            </div>
          )}

          {responseError && (
            <div className="p-4 rounded border border-rose-900/60 bg-rose-950/20 text-rose-300 flex items-center space-x-2">
              <AlertCircleIcon size={16} />
              <span>{responseError}</span>
            </div>
          )}

          {!loading && !responseError && responseStatus === null && (
            <div className="py-12 text-center text-content-faint space-y-2">
              <p>Configure an endpoint path above and click "Send Request" to test.</p>
              <p className="text-[11px] text-content-muted">
                Requests are processed by the live Java mock engine and logged into MySQL.
              </p>
            </div>
          )}

          {/* Response Payload */}
          {!loading && responseBody !== null && (
            <div className="space-y-4">
              <div>
                <label className="block text-content-muted text-[11px] mb-1">Response Body</label>
                <pre className="p-4 rounded bg-bg-sidebar border border-border-neutral text-content-main font-mono text-xs leading-relaxed overflow-x-auto max-h-[400px]">
                  {responseBody || '(Empty body)'}
                </pre>
              </div>

              {responseHeaders && Object.keys(responseHeaders).length > 0 && (
                <div>
                  <label className="block text-content-muted text-[11px] mb-1">
                    Response Headers
                  </label>
                  <pre className="p-3 rounded bg-bg-sidebar border border-border-neutral text-content-muted text-[11px] overflow-x-auto">
                    {JSON.stringify(responseHeaders, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
