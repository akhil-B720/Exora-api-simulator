package com.exora.service;

import com.exora.dto.PageResponseDto;
import com.exora.dto.RequestLogDto;
import com.exora.entity.MockEndpoint;
import com.exora.entity.RequestLog;
import com.exora.exception.ResourceNotFoundException;
import com.exora.repository.RequestLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RequestLogService {

    private final RequestLogRepository requestLogRepository;

    public RequestLogService(RequestLogRepository requestLogRepository) {
        this.requestLogRepository = requestLogRepository;
    }

    @Transactional
    public RequestLog recordLog(MockEndpoint endpoint, String httpMethod, String requestPath,
                                int responseStatus, long durationMs, String outcome,
                                String safeRequestMetadata, String requestBody,
                                String responseBody, String responseHeaders, String errorSummary) {
        RequestLog log = new RequestLog(
                endpoint,
                httpMethod,
                requestPath,
                responseStatus,
                durationMs,
                outcome,
                safeRequestMetadata,
                requestBody,
                responseBody,
                responseHeaders,
                errorSummary
        );
        return requestLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public PageResponseDto<RequestLogDto> listRequests(String method, Integer status, Long endpointId, Pageable pageable) {
        String cleanMethod = (method != null && !method.trim().isEmpty()) ? method.trim().toUpperCase() : null;
        Page<RequestLog> page = requestLogRepository.findWithFilters(cleanMethod, status, endpointId, pageable);

        return new PageResponseDto<>(
                page.getContent().stream().map(this::mapToDto).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Transactional(readOnly = true)
    public RequestLogDto getRequestById(Long id) {
        RequestLog log = requestLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request log not found with ID: " + id));
        return mapToDto(log);
    }

    public RequestLogDto mapToDto(RequestLog log) {
        RequestLogDto dto = new RequestLogDto();
        dto.setId(log.getId());
        if (log.getEndpoint() != null) {
            dto.setEndpointId(log.getEndpoint().getId());
            dto.setEndpointName(log.getEndpoint().getName());
        }
        dto.setHttpMethod(log.getHttpMethod());
        dto.setRequestPath(log.getRequestPath());
        dto.setResponseStatus(log.getResponseStatus());
        dto.setDurationMs(log.getDurationMs());
        dto.setOutcome(log.getOutcome());
        dto.setTimestamp(log.getTimestamp());
        dto.setSafeRequestMetadata(log.getSafeRequestMetadata());
        dto.setRequestBody(log.getRequestBody());
        dto.setResponseBody(log.getResponseBody());
        dto.setResponseHeaders(log.getResponseHeaders());
        dto.setErrorSummary(log.getErrorSummary());
        return dto;
    }
}
