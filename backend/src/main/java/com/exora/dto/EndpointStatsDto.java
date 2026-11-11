package com.exora.dto;

public class EndpointStatsDto {

    private Long endpointId;
    private long totalRequests;
    private long successfulRequests;
    private long clientErrorRequests;
    private long serverErrorRequests;
    private double averageDurationMs;

    public EndpointStatsDto() {
    }

    public Long getEndpointId() {
        return endpointId;
    }

    public void setEndpointId(Long endpointId) {
        this.endpointId = endpointId;
    }

    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public long getSuccessfulRequests() {
        return successfulRequests;
    }

    public void setSuccessfulRequests(long successfulRequests) {
        this.successfulRequests = successfulRequests;
    }

    public long getClientErrorRequests() {
        return clientErrorRequests;
    }

    public void setClientErrorRequests(long clientErrorRequests) {
        this.clientErrorRequests = clientErrorRequests;
    }

    public long getServerErrorRequests() {
        return serverErrorRequests;
    }

    public void setServerErrorRequests(long serverErrorRequests) {
        this.serverErrorRequests = serverErrorRequests;
    }

    public double getAverageDurationMs() {
        return averageDurationMs;
    }

    public void setAverageDurationMs(double averageDurationMs) {
        this.averageDurationMs = averageDurationMs;
    }
}
