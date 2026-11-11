import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { HttpMethod, MockEndpointRequest } from '../types';
import { JsonEditor } from '../components/JsonEditor';
import { HeaderEditor } from '../components/HeaderEditor';
import { AlertCircleIcon, CheckIcon } from '../components/icons';

const COMMON_STATUS_CODES = [200, 201, 204, 400, 401, 403, 404, 429, 500, 503];

export const EndpointEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [httpMethod, setHttpMethod] = useState<HttpMethod>('GET');
  const [path, setPath] = useState('/api/');
  const [statusCode, setStatusCode] = useState<number>(200);
  const [delayMs, setDelayMs] = useState<number>(0);
  const [responseHeaders, setResponseHeaders] = useState('');
  const [responseBody, setResponseBody] = useState('{\n  "message": "Success"\n}');
  const [enabled, setEnabled] = useState(true);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      apiService
        .getEndpoint(parseInt(id, 10))
        .then((ep) => {
          setName(ep.name);
          setDescription(ep.description || '');
          setHttpMethod(ep.httpMethod);
          setPath(ep.path);
          setStatusCode(ep.statusCode);
          setDelayMs(ep.delayMs || 0);
          setResponseHeaders(ep.responseHeaders || '');
          setResponseBody(ep.responseBody || '');
          setEnabled(ep.enabled);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load endpoint configuration');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, isEditMode]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Endpoint name is required';
    } else if (name.length > 150) {
      errors.name = 'Endpoint name cannot exceed 150 characters';
    }

    if (!path.trim()) {
      errors.path = 'Path is required';
    } else if (!path.startsWith('/')) {
      errors.path = "Path must begin with a forward slash '/'";
    }

    if (statusCode < 100 || statusCode > 599) {
      errors.statusCode = 'HTTP status code must be between 100 and 599';
    }

    if (delayMs < 0 || delayMs > 10000) {
      errors.delayMs = 'Delay must be between 0 and 10000 milliseconds';
    }

    if (responseBody.trim()) {
      try {
        JSON.parse(responseBody);
      } catch (e: any) {
        errors.responseBody = 'Response body contains invalid JSON: ' + e.message;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError(null);

    const payload: MockEndpointRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      httpMethod,
      path: path.trim(),
      statusCode,
      delayMs,
      responseHeaders: responseHeaders.trim() || undefined,
      responseBody: responseBody.trim() || undefined,
      enabled,
    };

    try {
      if (isEditMode && id) {
        const updated = await apiService.updateEndpoint(parseInt(id, 10), payload);
        navigate(`/endpoints/${updated.id}`);
      } else {
        const created = await apiService.createEndpoint(payload);
        navigate(`/endpoints/${created.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save mock endpoint');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-content-faint">
        Loading endpoint configuration...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="pb-4 border-b border-border-neutral flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-content-main">
            {isEditMode ? 'Edit Mock Endpoint' : 'Create Mock Endpoint'}
          </h1>
          <p className="text-content-muted mt-1">
            {isEditMode
              ? `Updating configuration for endpoint ID ${id}`
              : 'Define method, path, response payload, and simulation latency'}
          </p>
        </div>
        <Link
          to={isEditMode && id ? `/endpoints/${id}` : '/endpoints'}
          className="px-3 py-1.5 rounded border border-border-neutral bg-bg-surface hover:bg-bg-hover text-content-muted hover:text-content-main"
        >
          Cancel
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded border border-rose-900/60 bg-rose-950/20 text-rose-300 flex items-center space-x-2">
          <AlertCircleIcon size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Route Settings */}
        <div className="border border-border-neutral rounded bg-bg-surface p-5 space-y-4">
          <h2 className="text-sm font-semibold text-content-main pb-2 border-b border-border-neutral">
            Route Specification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-content-muted mb-1 font-medium">HTTP Method</label>
              <select
                value={httpMethod}
                onChange={(e) => setHttpMethod(e.target.value as HttpMethod)}
                className="w-full bg-bg-sidebar border border-border-neutral rounded px-3 py-2 text-content-main outline-none focus:border-border-focus"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-content-muted mb-1 font-medium">Endpoint Path</label>
              <input
                type="text"
                placeholder="/api/products"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className={`w-full bg-bg-sidebar border ${
                  fieldErrors.path ? 'border-rose-500' : 'border-border-neutral'
                } rounded px-3 py-2 text-content-main outline-none focus:border-border-focus`}
              />
              {fieldErrors.path && <p className="text-rose-400 mt-1">{fieldErrors.path}</p>}
              <p className="text-content-faint text-[11px] mt-1">
                Sub-path relative to mock root. Invoked via: http://localhost:8080/mock{path}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-content-muted mb-1 font-medium">Endpoint Name</label>
              <input
                type="text"
                placeholder="Product Catalog API"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full bg-bg-sidebar border ${
                  fieldErrors.name ? 'border-rose-500' : 'border-border-neutral'
                } rounded px-3 py-2 text-content-main outline-none focus:border-border-focus`}
              />
              {fieldErrors.name && <p className="text-rose-400 mt-1">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-content-muted mb-1 font-medium">Description (Optional)</label>
              <input
                type="text"
                placeholder="Simulates production inventory items for frontend"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-bg-sidebar border border-border-neutral rounded px-3 py-2 text-content-main outline-none focus:border-border-focus"
              />
            </div>
          </div>
        </div>

        {/* Response Configuration */}
        <div className="border border-border-neutral rounded bg-bg-surface p-5 space-y-4">
          <h2 className="text-sm font-semibold text-content-main pb-2 border-b border-border-neutral">
            Response Behavior
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-content-muted mb-1 font-medium">HTTP Status Code</label>
              <input
                type="number"
                value={statusCode}
                onChange={(e) => setStatusCode(parseInt(e.target.value, 10) || 200)}
                className={`w-full bg-bg-sidebar border ${
                  fieldErrors.statusCode ? 'border-rose-500' : 'border-border-neutral'
                } rounded px-3 py-2 text-content-main outline-none focus:border-border-focus`}
              />
              {fieldErrors.statusCode && (
                <p className="text-rose-400 mt-1">{fieldErrors.statusCode}</p>
              )}

              {/* Status Code Presets */}
              <div className="flex flex-wrap gap-1 mt-2">
                {COMMON_STATUS_CODES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setStatusCode(code)}
                    className={`px-2 py-0.5 rounded text-[11px] border ${
                      statusCode === code
                        ? 'bg-accent/20 border-accent/60 text-accent font-semibold'
                        : 'border-border-neutral hover:bg-bg-hover text-content-muted'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-content-muted mb-1 font-medium">
                Simulation Latency (milliseconds)
              </label>
              <input
                type="number"
                min="0"
                max="10000"
                value={delayMs}
                onChange={(e) => setDelayMs(parseInt(e.target.value, 10) || 0)}
                className={`w-full bg-bg-sidebar border ${
                  fieldErrors.delayMs ? 'border-rose-500' : 'border-border-neutral'
                } rounded px-3 py-2 text-content-main outline-none focus:border-border-focus`}
              />
              {fieldErrors.delayMs && <p className="text-rose-400 mt-1">{fieldErrors.delayMs}</p>}
              <p className="text-content-faint text-[11px] mt-1">
                Server will delay response by this duration (safe limit: 0 to 10,000ms).
              </p>
            </div>
          </div>

          <div>
            <HeaderEditor
              value={responseHeaders}
              onChange={setResponseHeaders}
              title="Custom Response Headers"
            />
          </div>

          <div>
            <label className="block text-content-muted mb-1 font-medium">Response JSON Body</label>
            <JsonEditor
              value={responseBody}
              onChange={setResponseBody}
              height="280px"
              placeholder="Enter JSON response payload"
            />
            {fieldErrors.responseBody && (
              <p className="text-rose-400 mt-1">{fieldErrors.responseBody}</p>
            )}
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="enabledCheck"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-border-neutral bg-bg-sidebar text-accent focus:ring-0"
            />
            <label htmlFor="enabledCheck" className="text-content-main cursor-pointer">
              Enable endpoint immediately upon saving
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Link
            to={isEditMode && id ? `/endpoints/${id}` : '/endpoints'}
            className="px-4 py-2 rounded border border-border-neutral bg-bg-surface hover:bg-bg-hover text-content-muted hover:text-content-main transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 px-5 py-2 rounded bg-accent/20 border border-accent/50 hover:bg-accent/30 text-accent font-semibold transition-colors disabled:opacity-50"
          >
            <CheckIcon size={14} />
            <span>{saving ? 'Saving...' : isEditMode ? 'Update Endpoint' : 'Create Endpoint'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
