import type {
  DashboardStats,
  EndpointStats,
  HealthStatus,
  HttpMethod,
  MockEndpoint,
  MockEndpointRequest,
  PageResponse,
  RequestLog
} from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export class ApiServiceError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiServiceError';
    this.status = status;
    this.data = data;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = data && typeof data === 'object' && data.message
      ? data.message
      : `Request failed with status ${response.status}: ${response.statusText}`;
    throw new ApiServiceError(errorMessage, response.status, data);
  }

  return data as T;
}

export const apiService = {
  async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    return handleResponse<HealthStatus>(res);
  },

  async getOverviewStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE_URL}/api/stats/overview`);
    return handleResponse<DashboardStats>(res);
  },

  async getEndpoints(params?: {
    search?: string;
    method?: HttpMethod;
    enabled?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PageResponse<MockEndpoint>> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.method) query.append('method', params.method);
    if (params?.enabled !== undefined) query.append('enabled', String(params.enabled));
    if (params?.page !== undefined) query.append('page', String(params.page));
    if (params?.size !== undefined) query.append('size', String(params.size));
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortDir) query.append('sortDir', params.sortDir);

    const url = `${API_BASE_URL}/api/mock-endpoints?${query.toString()}`;
    const res = await fetch(url);
    return handleResponse<PageResponse<MockEndpoint>>(res);
  },

  async getEndpoint(id: number): Promise<MockEndpoint> {
    const res = await fetch(`${API_BASE_URL}/api/mock-endpoints/${id}`);
    return handleResponse<MockEndpoint>(res);
  },

  async createEndpoint(data: MockEndpointRequest): Promise<MockEndpoint> {
    const res = await fetch(`${API_BASE_URL}/api/mock-endpoints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<MockEndpoint>(res);
  },

  async updateEndpoint(id: number, data: MockEndpointRequest): Promise<MockEndpoint> {
    const res = await fetch(`${API_BASE_URL}/api/mock-endpoints/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<MockEndpoint>(res);
  },

  async deleteEndpoint(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/mock-endpoints/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new ApiServiceError(`Failed to delete endpoint`, res.status);
    }
  },

  async toggleEndpoint(id: number, enabled?: boolean): Promise<MockEndpoint> {
    const res = await fetch(`${API_BASE_URL}/api/mock-endpoints/${id}/enabled`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enabled !== undefined ? { enabled } : {}),
    });
    return handleResponse<MockEndpoint>(res);
  },

  async getEndpointStats(id: number): Promise<EndpointStats> {
    const res = await fetch(`${API_BASE_URL}/api/mock-endpoints/${id}/stats`);
    return handleResponse<EndpointStats>(res);
  },

  async getRequests(params?: {
    method?: string;
    status?: number;
    endpointId?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PageResponse<RequestLog>> {
    const query = new URLSearchParams();
    if (params?.method) query.append('method', params.method);
    if (params?.status !== undefined) query.append('status', String(params.status));
    if (params?.endpointId !== undefined) query.append('endpointId', String(params.endpointId));
    if (params?.page !== undefined) query.append('page', String(params.page));
    if (params?.size !== undefined) query.append('size', String(params.size));
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortDir) query.append('sortDir', params.sortDir);

    const url = `${API_BASE_URL}/api/requests?${query.toString()}`;
    const res = await fetch(url);
    return handleResponse<PageResponse<RequestLog>>(res);
  },

  async getRequest(id: number): Promise<RequestLog> {
    const res = await fetch(`${API_BASE_URL}/api/requests/${id}`);
    return handleResponse<RequestLog>(res);
  },

  async executeLiveRequest(
    method: HttpMethod,
    url: string,
    headers: Record<string, string>,
    body?: string
  ): Promise<{
    status: number;
    statusText: string;
    durationMs: number;
    headers: Record<string, string>;
    body: string;
    isJson: boolean;
  }> {
    const startTime = performance.now();
    const reqHeaders = new Headers();
    Object.entries(headers).forEach(([k, v]) => {
      if (k && v) reqHeaders.append(k, v);
    });

    const init: RequestInit = {
      method,
      headers: reqHeaders,
    };

    if (['POST', 'PUT', 'PATCH'].includes(method) && body && body.trim().length > 0) {
      init.body = body;
    }

    try {
      const response = await fetch(url, init);
      const durationMs = Math.round(performance.now() - startTime);

      const respHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        respHeaders[key] = val;
      });

      const responseText = await response.text();
      let isJson = false;
      try {
        JSON.parse(responseText);
        isJson = true;
      } catch {
        isJson = false;
      }

      return {
        status: response.status,
        statusText: response.statusText,
        durationMs,
        headers: respHeaders,
        body: responseText,
        isJson,
      };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      throw new ApiServiceError(err.message || 'Network error executing request', 0, {
        durationMs,
      });
    }
  },
};
