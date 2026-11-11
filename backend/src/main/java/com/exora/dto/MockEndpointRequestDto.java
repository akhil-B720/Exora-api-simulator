package com.exora.dto;

import com.exora.entity.HttpMethod;
import jakarta.validation.constraints.*;

public class MockEndpointRequestDto {

    @NotBlank(message = "Endpoint name is required")
    @Size(max = 150, message = "Endpoint name cannot exceed 150 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "HTTP method is required")
    private HttpMethod httpMethod;

    @NotBlank(message = "Path is required")
    @Pattern(regexp = "^/[a-zA-Z0-9_\\-/{}.~]*$", message = "Path must start with '/' and contain only valid URL path characters")
    @Size(max = 255, message = "Path cannot exceed 255 characters")
    private String path;

    @NotNull(message = "Status code is required")
    @Min(value = 100, message = "Status code must be at least 100")
    @Max(value = 599, message = "Status code must be at most 599")
    private Integer statusCode = 200;

    private String responseBody;

    private String responseHeaders;

    @Min(value = 0, message = "Delay cannot be negative")
    @Max(value = 10000, message = "Delay cannot exceed 10000 milliseconds")
    private Integer delayMs = 0;

    private Boolean enabled = true;

    public MockEndpointRequestDto() {
    }

    public MockEndpointRequestDto(String name, String description, HttpMethod httpMethod,
                                  String path, Integer statusCode, String responseBody,
                                  String responseHeaders, Integer delayMs, Boolean enabled) {
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
}
