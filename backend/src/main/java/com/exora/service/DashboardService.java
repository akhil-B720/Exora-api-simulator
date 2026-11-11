package com.exora.service;

import com.exora.dto.DashboardStatsDto;
import com.exora.dto.MockEndpointResponseDto;
import com.exora.dto.RequestLogDto;
import com.exora.repository.MockEndpointRepository;
import com.exora.repository.RequestLogRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final MockEndpointRepository endpointRepository;
    private final RequestLogRepository requestLogRepository;
    private final MockEndpointService mockEndpointService;
    private final RequestLogService requestLogService;

    public DashboardService(MockEndpointRepository endpointRepository,
                            RequestLogRepository requestLogRepository,
                            MockEndpointService mockEndpointService,
                            RequestLogService requestLogService) {
        this.endpointRepository = endpointRepository;
        this.requestLogRepository = requestLogRepository;
        this.mockEndpointService = mockEndpointService;
        this.requestLogService = requestLogService;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();

        long totalEndpoints = endpointRepository.count();
        long activeEndpoints = endpointRepository.countByEnabledTrue();
        long inactiveEndpoints = endpointRepository.countByEnabledFalse();

        long totalRequests = requestLogRepository.count();
        long successfulRequests = requestLogRepository.countByResponseStatusBetween(200, 299);
        long failedRequests = requestLogRepository.countByResponseStatusBetween(400, 599);

        stats.setTotalEndpoints(totalEndpoints);
        stats.setActiveEndpoints(activeEndpoints);
        stats.setInactiveEndpoints(inactiveEndpoints);
        stats.setTotalRequests(totalRequests);
        stats.setSuccessfulRequests(successfulRequests);
        stats.setFailedRequests(failedRequests);

        Map<Integer, Long> distribution = new LinkedHashMap<>();
        List<Object[]> distResults = requestLogRepository.getStatusCodeDistribution();
        for (Object[] row : distResults) {
            if (row[0] instanceof Integer statusCode && row[1] instanceof Long count) {
                distribution.put(statusCode, count);
            }
        }
        stats.setStatusCodeDistribution(distribution);

        List<MockEndpointResponseDto> recentEndpoints = endpointRepository.findAll(
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent().stream().map(mockEndpointService::mapToResponseDto).toList();
        stats.setRecentEndpoints(recentEndpoints);

        List<RequestLogDto> recentRequests = requestLogRepository.findTopRecent(
                PageRequest.of(0, 10)
        ).stream().map(requestLogService::mapToDto).toList();
        stats.setRecentRequests(recentRequests);

        return stats;
    }
}
