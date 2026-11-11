package com.exora.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "mock_endpoints",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_mock_endpoints_method_path", columnNames = {"http_method", "path"})
    },
    indexes = {
        @Index(name = "idx_mock_endpoints_method", columnList = "http_method"),
        @Index(name = "idx_mock_endpoints_enabled", columnList = "enabled")
    }
)
public class MockEndpoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "http_method", nullable = false, length = 10)
    private HttpMethod httpMethod;

    @Column(nullable = false, length = 255)
    private String path;

    @Column(name = "status_code", nullable = false)
    private Integer statusCode = 200;

    @Lob
    @Column(name = "response_body", columnDefinition = "LONGTEXT")
    private String responseBody;

    @Column(name = "response_headers", columnDefinition = "TEXT")
    private String responseHeaders;

    @Column(name = "delay_ms", nullable = false)
    private Integer delayMs = 0;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public MockEndpoint() {
    }

    public MockEndpoint(String name, String description, HttpMethod httpMethod, String path,
                        Integer statusCode, String responseBody, String responseHeaders,
                        Integer delayMs, Boolean enabled) {
        this.name = name;
        this.description = description;
        this.httpMethod = httpMethod;
        this.path = path;
        this.statusCode = statusCode != null ? statusCode : 200;
        this.responseBody = responseBody;
        this.responseHeaders = responseHeaders;
        this.delayMs = delayMs != null ? delayMs : 0;
        this.enabled = enabled != null ? enabled : true;
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.statusCode == null) {
            this.statusCode = 200;
        }
        if (this.delayMs == null) {
            this.delayMs = 0;
        }
        if (this.enabled == null) {
            this.enabled = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public HttpMethod getHttpMethod() {
        return httpMethod;
    }

    public void setHttpMethod(HttpMethod httpMethod) {
        this.httpMethod = httpMethod;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Integer getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(Integer statusCode) {
        this.statusCode = statusCode;
    }

    public String getResponseBody() {
        return responseBody;
    }

    public void setResponseBody(String responseBody) {
        this.responseBody = responseBody;
    }

    public String getResponseHeaders() {
        return responseHeaders;
    }

    public void setResponseHeaders(String responseHeaders) {
        this.responseHeaders = responseHeaders;
    }

    public Integer getDelayMs() {
        return delayMs;
    }

    public void setDelayMs(Integer delayMs) {
        this.delayMs = delayMs;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
