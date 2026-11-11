-- Migration V1: Create mock_endpoints table
CREATE TABLE IF NOT EXISTS mock_endpoints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    http_method VARCHAR(10) NOT NULL,
    path VARCHAR(255) NOT NULL,
    status_code INT NOT NULL DEFAULT 200,
    response_body LONGTEXT,
    response_headers TEXT,
    delay_ms INT NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_mock_endpoints_method_path UNIQUE (http_method, path),
    INDEX idx_mock_endpoints_method (http_method),
    INDEX idx_mock_endpoints_enabled (enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
