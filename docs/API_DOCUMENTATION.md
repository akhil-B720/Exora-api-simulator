# EXORA REST API Specification

This document details the RESTful APIs exposed by the EXORA backend service (`http://localhost:8080`).

---

## 1. Mock Endpoint Management

### 1.1 List Endpoints
Retrieve a paginated, filterable list of mock endpoint configurations.

- **Method**: `GET`
- **Path**: `/api/mock-endpoints`
- **Query Parameters**:
  - `search` (string, optional): Filter by name or path substring.
  - `method` (enum, optional): `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
  - `enabled` (boolean, optional): Filter by active status.
  - `page` (integer, default: 0): Page index.
  - `size` (integer, default: 20): Items per page.
  - `sortBy` (string, default: "createdAt"): Field to sort by.
  - `sortDir` (string, default: "desc"): Sort direction (`asc` or `desc`).

**Example Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Get Products Catalog",
      "description": "Returns electronics product list",
      "httpMethod": "GET",
      "path": "/api/products",
      "statusCode": 200,
      "responseBody": "{\"products\":[{\"id\":1,\"name\":\"Laptop\",\"price\":55000}]}",
      "responseHeaders": "{\"X-Custom-Header\":\"ExoraMock\"}",
      "delayMs": 0,
      "enabled": true,
      "createdAt": "2026-10-22T19:53:08",
      "updatedAt": "2026-10-22T19:53:08",
      "mockUrl": "http://localhost:8080/mock/api/products",
      "requestCount": 2
    }
  ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

---

### 1.2 Create Endpoint
Register a new mock HTTP endpoint.

- **Method**: `POST`
- **Path**: `/api/mock-endpoints`
- **Content-Type**: `application/json`

**Request Body:**
```json
{
  "name": "Create Order",
  "description": "Handles order placement and returns generated order ID",
  "httpMethod": "POST",
  "path": "/api/orders",
  "statusCode": 201,
  "delayMs": 150,
  "responseHeaders": "{\"Location\":\"/api/orders/9981\"}",
  "responseBody": "{\"orderId\":\"9981\",\"status\":\"CREATED\"}",
  "enabled": true
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "name": "Create Order",
  "description": "Handles order placement and returns generated order ID",
  "httpMethod": "POST",
  "path": "/api/orders",
  "statusCode": 201,
  "responseBody": "{\"orderId\":\"9981\",\"status\":\"CREATED\"}",
  "responseHeaders": "{\"Location\":\"/api/orders/9981\"}",
  "delayMs": 150,
  "enabled": true,
  "createdAt": "2026-10-22T20:16:16",
  "updatedAt": "2026-10-22T20:16:16",
  "mockUrl": "http://localhost:8080/mock/api/orders",
  "requestCount": 0
}
```

---

### 1.3 Get Endpoint by ID
- **Method**: `GET`
- **Path**: `/api/mock-endpoints/{id}`
- **Response**: `200 OK` with endpoint JSON object or `404 Not Found`.

---

### 1.4 Update Endpoint
- **Method**: `PUT`
- **Path**: `/api/mock-endpoints/{id}`
- **Content-Type**: `application/json`
- **Response**: `200 OK` with updated endpoint JSON object.

---

### 1.5 Toggle Endpoint Active State
Instantly enable or disable an endpoint without modifying its parameters.

- **Method**: `PATCH`
- **Path**: `/api/mock-endpoints/{id}/enabled`
- **Content-Type**: `application/json`

**Request Body (optional if toggling opposite state):**
```json
{
  "enabled": false
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "enabled": false,
  ...
}
```

---

### 1.6 Delete Endpoint
- **Method**: `DELETE`
- **Path**: `/api/mock-endpoints/{id}`
- **Response**: `204 No Content`. Associated request logs retain their records with `endpointId = null`.

---

## 2. Dynamic Mock Simulation Engine

Clients send requests to `/mock/{configuredPath}` using any supported HTTP method.

### 2.1 Invocation Request
```bash
curl -i -X POST http://localhost:8080/mock/api/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'
```

### 2.2 Success Response (201 Created)
```http
HTTP/1.1 201 Created
Content-Type: application/json;charset=UTF-8
Location: /api/orders/9981
Content-Length: 35

{"orderId":"9981","status":"CREATED"}
```

### 2.3 Disabled Endpoint Response (403 Forbidden)
```json
{
  "timestamp": "2026-10-22T20:17:17",
  "status": 403,
  "error": "Forbidden",
  "message": "The mock endpoint for GET /api/products is currently disabled",
  "path": "/mock/api/products"
}
```

### 2.4 Unmatched Endpoint Response (404 Not Found)
```json
{
  "timestamp": "2026-10-22T20:16:56",
  "status": 404,
  "error": "Not Found",
  "message": "No mock endpoint configured for method GET and path /api/unknown-service",
  "path": "/mock/api/unknown-service"
}
```

---

## 3. Request Inspection Logs

### 3.1 List Request Logs
- **Method**: `GET`
- **Path**: `/api/requests`
- **Query Parameters**:
  - `endpointId` (integer, optional)
  - `page` (integer, default: 0)
  - `size` (integer, default: 20)

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "endpointId": 1,
      "endpointName": "Get Products Catalog",
      "httpMethod": "GET",
      "requestPath": "/api/products",
      "responseStatus": 200,
      "durationMs": 101,
      "outcome": "SUCCESS",
      "timestamp": "2026-10-22T19:56:44",
      "safeRequestMetadata": "{\"headers\":{\"host\":\"localhost:8080\"},\"remoteAddr\":\"127.0.0.1\"}",
      "requestBody": "",
      "responseBody": "{\"products\":[{\"id\":1,\"name\":\"Laptop\",\"price\":55000}]}",
      "responseHeaders": "{\"X-Custom-Header\":\"ExoraMock\"}",
      "errorSummary": null
    }
  ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

---

## 4. Health and Metrics

### 4.1 System Health
- **Method**: `GET`
- **Path**: `/api/health`

**Response (200 OK):**
```json
{
  "status": "UP",
  "service": "exora-backend",
  "version": "1.0.0",
  "timestamp": "2026-10-22T20:14:15",
  "database": {
    "status": "CONNECTED",
    "databaseProductName": "MySQL",
    "databaseProductVersion": "8.0.39"
  }
}
```

### 4.2 Dashboard Overview Stats
- **Method**: `GET`
- **Path**: `/api/stats/overview`

**Response (200 OK):**
```json
{
  "totalEndpoints": 2,
  "activeEndpoints": 2,
  "inactiveEndpoints": 0,
  "totalRequests": 3,
  "successfulRequests": 3,
  "failedRequests": 0,
  "statusCodeDistribution": {
    "200": 2,
    "201": 1
  },
  "recentEndpoints": [...],
  "recentRequests": [...]
}
```
