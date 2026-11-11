export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface MockEndpoint {
  id: number;
  name: string;
  description?: string;
  httpMethod: HttpMethod;
  path: string;
  statusCode: number;
  responseBody?: string;
  responseHeaders?: string;
  delayMs: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  mockUrl: string;
  requestCount: number;
}

export interface MockEndpointRequest {
  name: string;
  description?: string;
  httpMethod: HttpMethod;
  path: string;
  statusCode: number;
  responseBody?: string;
  responseHeaders?: string;
  delayMs: number;
  enabled: boolean;
}

export interface RequestLog {
  id: number;
  endpointId?: number;
  endpointName?: string;
  httpMethod: string;
  requestPath: string;
  responseStatus: number;
  durationMs: number;
  outcome: string;
  timestamp: string;
  safeRequestMetadata?: string;
  requestBody?: string;
  responseBody?: string;
  responseHeaders?: string;
  errorSummary?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export interface DashboardStats {
  totalEndpoints: number;
  activeEndpoints: number;
  inactiveEndpoints: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  statusCodeDistribution: Record<string, number>;
  recentEndpoints: MockEndpoint[];
  recentRequests: RequestLog[];
}

export interface EndpointStats {
  endpointId: number;
  totalRequests: number;
  successfulRequests: number;
  clientErrorRequests: number;
  serverErrorRequests: number;
  averageDurationMs: number;
}

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  database?: {
    status: string;
    databaseProductName?: string;
    databaseProductVersion?: string;
    error?: string;
  };
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
