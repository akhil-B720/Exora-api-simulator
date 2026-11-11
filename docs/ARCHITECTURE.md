# EXORA System Architecture

## 1. Architectural Philosophy

EXORA follows a clean layered enterprise architecture implemented with Java 21 LTS and Spring Boot 3.3.4 on the backend, paired with a React 19 and TypeScript frontend. The system separates administrative API management from runtime mock request simulation.

```mermaid
flowchart TD
    subgraph ClientLayer["Client Layer"]
        Browser["React 19 SPA (Vite / Tailwind)"]
        ExternalClient["External Apps / Mobile / curl"]
    end

    subgraph SecurityRouting["Routing & Gateway Layer"]
        Dispatcher["Spring DispatcherServlet"]
        CorsFilter["CorsRegistry Configuration"]
    end

    subgraph ControllerLayer["Controller Layer"]
        AdminEndpoints["MockEndpointController (/api/mock-endpoints)"]
        AdminLogs["RequestLogController (/api/requests)"]
        AdminHealth["HealthController (/api/health)"]
        MockEngine["DynamicMockEngineController (/mock/**)"]
    end

    subgraph ServiceLayer["Service Layer"]
        EndpointService["MockEndpointService (CRUD, Validation, State)"]
        LogService["RequestLogService (Asynchronous Logging, Header Sanitization)"]
        DashService["DashboardService (Real-time Metric Aggregation)"]
    end

    subgraph PersistenceLayer["Data Access Layer"]
        EndpointRepo["MockEndpointRepository (Spring Data JPA)"]
        LogRepo["RequestLogRepository (Spring Data JPA)"]
        Hibernate["Hibernate 6.5 ORM"]
    end

    subgraph StorageLayer["Persistence Engine"]
        MySQL[("MySQL 8.0 Server (InnoDB)")]
        Flyway["Flyway Migration Engine (V1, V2)"]
    end

    Browser -->|JSON REST API| Dispatcher
    ExternalClient -->|Simulated HTTP Requests| Dispatcher
    Dispatcher --> CorsFilter

    CorsFilter --> AdminEndpoints
    CorsFilter --> AdminLogs
    CorsFilter --> AdminHealth
    CorsFilter --> MockEngine

    AdminEndpoints --> EndpointService
    AdminLogs --> LogService
    AdminHealth --> Hibernate
    MockEngine --> EndpointService
    MockEngine --> LogService

    EndpointService --> EndpointRepo
    LogService --> LogRepo
    DashService --> EndpointRepo
    DashService --> LogRepo

    EndpointRepo --> Hibernate
    LogRepo --> Hibernate
    Hibernate --> MySQL
    Flyway --> MySQL
```

---

## 2. Dynamic Mock Engine Lifecycle

The dynamic mock engine is implemented inside `DynamicMockEngineController` mapped to `/mock/**`. When a client sends a request to any path prefixed with `/mock/`, the engine executes the following pipeline:

```mermaid
sequenceDiagram
    autonumber
    actor Caller as Client / External System
    participant Engine as DynamicMockEngineController
    participant Service as MockEndpointService
    participant Repo as MockEndpointRepository
    participant DB as MySQL 8.0
    participant Logger as RequestLogService

    Caller->>Engine: HTTP Method (GET/POST/PUT/PATCH/DELETE) on /mock/{targetPath}
    Note over Engine: Extract raw path and incoming HTTP method
    Engine->>Service: findMatchingEndpoint(method, targetPath)
    Service->>Repo: findByHttpMethodAndPath(method, targetPath)
    Repo->>DB: SQL Query on indexed (http_method, path)
    DB-->>Repo: MockEndpoint entity
    Repo-->>Service: Optional<MockEndpoint>
    
    alt Endpoint Not Found
        Service-->>Engine: Empty
        Engine-->>Caller: 404 Not Found (JSON error description)
    else Endpoint Is Inactive (enabled == false)
        Service-->>Engine: Endpoint (disabled)
        Engine-->>Caller: 403 Forbidden (Endpoint is currently disabled)
    else Endpoint Active
        Service-->>Engine: MockEndpoint
        Note over Engine: Evaluate delayMs (0 to 10,000ms)
        opt delayMs > 0
            Engine->>Engine: Thread.sleep(delayMs)
        end
        Note over Engine: Sanitize caller headers (strip tokens/cookies)
        Engine->>Logger: recordRequest(endpoint, metadata, status, duration)
        Logger->>DB: INSERT into request_logs
        Engine-->>Caller: Custom Status Code + Custom Headers + Configured Body
    end
```

---

## 3. Key Design Decisions

### 3.1 Non-Destructive Endpoint Toggling
Rather than requiring developers to delete and recreate endpoints to simulate outages, endpoints include an `enabled` boolean flag. Inactive endpoints immediately return HTTP 403 Forbidden, allowing developers to test frontend resilience to server errors without losing configuration.

### 3.2 Sensitive Header Sanitization
When external clients invoke endpoints with authentication headers, storing sensitive credentials in plain text presents a security hazard. EXORA implements a sanitization routine before persisting metadata into `request_logs`. Headers matching `Authorization`, `Cookie`, `Set-Cookie`, `X-Api-Key`, or `Proxy-Authorization` are replaced with `[REDACTED]`.

### 3.3 Dynamic Schema Management with Flyway
Database schemas are version-controlled using Flyway migrations located in `backend/src/main/resources/db/migration/`:
- `V1__create_mock_endpoints_table.sql`: Primary endpoint configuration table, composite unique constraint on `(http_method, path)`.
- `V2__create_request_logs_table.sql`: Request inspection audit log, foreign key relationship referencing `mock_endpoints(id)` with `ON DELETE SET NULL`.

### 3.4 Decoupled Frontend Design System
The frontend avoids heavy third-party UI component libraries in favor of Tailwind CSS utility classes and clean inline SVG icons. This ensures minimal bundle size (348 kB JS gzip-ready), sub-second page loads, and consistent dark-mode styling aligned with professional developer tools.
