package com.exora.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsDto {

    private long totalEndpoints;
    private long activeEndpoints;
    private long inactiveEndpoints;
    private long totalRequests;
    private long successfulRequests;
    private long failedRequests;
    private Map<Integer, Long> statusCodeDistribution;
    private List<MockEndpointResponseDto> recentEndpoints;
    private List<RequestLogDto> recentRequests;

    public DashboardStatsDto() {
    }

    public long getTotalEndpoints() {
        return totalEndpoints;
    }

    public void setTotalEndpoints(long totalEndpoints) {
        this.totalEndpoints = totalEndpoints;
    }

    public long getActiveEndpoints() {
        return activeEndpoints;
    }

    public void setActiveEndpoints(long activeEndpoints) {
        this.activeEndpoints = activeEndpoints;
    }

    public long getInactiveEndpoints() {
        return inactiveEndpoints;
    }

    public void setInactiveEndpoints(long inactiveEndpoints) {
        this.inactiveEndpoints = inactiveEndpoints;
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

    public long getFailedRequests() {
        return failedRequests;
    }

    public void setFailedRequests(long failedRequests) {
        this.failedRequests = failedRequests;
    }

    public Map<Integer, Long> getStatusCodeDistribution() {
        return statusCodeDistribution;
    }

    public void setStatusCodeDistribution(Map<Integer, Long> statusCodeDistribution) {
        this.statusCodeDistribution = statusCodeDistribution;
    }

    public List<MockEndpointResponseDto> getRecentEndpoints() {
        return recentEndpoints;
    }

    public void setRecentEndpoints(List<MockEndpointResponseDto> recentEndpoints) {
        this.recentEndpoints = recentEndpoints;
    }

    public List<RequestLogDto> getRecentRequests() {
        return recentRequests;
    }

    public void setRecentRequests(List<RequestLogDto> recentRequests) {
        this.recentRequests = recentRequests;
    }
}
