package com.exora.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "request_logs",
    indexes = {
        @Index(name = "idx_request_logs_timestamp", columnList = "timestamp"),
        @Index(name = "idx_request_logs_endpoint", columnList = "endpoint_id"),
        @Index(name = "idx_request_logs_method", columnList = "http_method"),
        @Index(name = "idx_request_logs_status", columnList = "response_status")
    }
)
public class RequestLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endpoint_id", foreignKey = @ForeignKey(name = "fk_request_logs_endpoint"))
    private MockEndpoint endpoint;

    @Column(name = "http_method", nullable = false, length = 10)
    private String httpMethod;

    @Column(name = "request_path", nullable = false, length = 255)
    private String requestPath;

    @Column(name = "response_status", nullable = false)
    private Integer responseStatus;

    @Column(name = "duration_ms", nullable = false)
    private Long durationMs;

    @Column(nullable = false, length = 50)
    private String outcome;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column(name = "safe_request_metadata", columnDefinition = "TEXT")
    private String safeRequestMetadata;

    @Lob
    @Column(name = "request_body", columnDefinition = "LONGTEXT")
    private String requestBody;

    @Lob
    @Column(name = "response_body", columnDefinition = "LONGTEXT")
    private String responseBody;

    @Column(name = "response_headers", columnDefinition = "TEXT")
    private String responseHeaders;

    @Column(name = "error_summary", length = 500)
    private String errorSummary;

    public RequestLog() {
    }

    public RequestLog(MockEndpoint endpoint, String httpMethod, String requestPath,
                      Integer responseStatus, Long durationMs, String outcome,
                      String safeRequestMetadata, String requestBody, String responseBody,
                      String responseHeaders, String errorSummary) {
        this.endpoint = endpoint;
        this.httpMethod = httpMethod;
        this.requestPath = requestPath;
        this.responseStatus = responseStatus;
        this.durationMs = durationMs;
        this.outcome = outcome;
        this.safeRequestMetadata = safeRequestMetadata;
        this.requestBody = requestBody;
        this.responseBody = responseBody;
        this.responseHeaders = responseHeaders;
        this.errorSummary = errorSummary;
    }

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public MockEndpoint getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(MockEndpoint endpoint) {
        this.endpoint = endpoint;
    }

    public String getHttpMethod() {
        return httpMethod;
    }

    public void setHttpMethod(String httpMethod) {
        this.httpMethod = httpMethod;
    }

    public String getRequestPath() {
        return requestPath;
    }

    public void setRequestPath(String requestPath) {
        this.requestPath = requestPath;
    }

    public Integer getResponseStatus() {
        return responseStatus;
    }

    public void setResponseStatus(Integer responseStatus) {
        this.responseStatus = responseStatus;
    }

    public Long getDurationMs() {
        return durationMs;
    }

    public void setDurationMs(Long durationMs) {
        this.durationMs = durationMs;
    }

    public String getOutcome() {
        return outcome;
    }

    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getSafeRequestMetadata() {
        return safeRequestMetadata;
    }

    public void setSafeRequestMetadata(String safeRequestMetadata) {
        this.safeRequestMetadata = safeRequestMetadata;
    }

    public String getRequestBody() {
        return requestBody;
    }

    public void setRequestBody(String requestBody) {
        this.requestBody = requestBody;
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

    public String getErrorSummary() {
        return errorSummary;
    }

    public void setErrorSummary(String errorSummary) {
        this.errorSummary = errorSummary;
    }
}
