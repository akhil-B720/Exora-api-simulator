-- Migration V2: Create request_logs table
CREATE TABLE IF NOT EXISTS request_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    endpoint_id BIGINT NULL,
    http_method VARCHAR(10) NOT NULL,
    request_path VARCHAR(255) NOT NULL,
    response_status INT NOT NULL,
    duration_ms BIGINT NOT NULL,
    outcome VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    safe_request_metadata TEXT,
    request_body LONGTEXT,
    response_body LONGTEXT,
    response_headers TEXT,
    error_summary VARCHAR(500),
    CONSTRAINT fk_request_logs_endpoint FOREIGN KEY (endpoint_id) REFERENCES mock_endpoints (id) ON DELETE SET NULL,
    INDEX idx_request_logs_timestamp (timestamp),
    INDEX idx_request_logs_endpoint (endpoint_id),
    INDEX idx_request_logs_method (http_method),
    INDEX idx_request_logs_status (response_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
