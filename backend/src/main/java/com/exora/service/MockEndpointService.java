package com.exora.service;

import com.exora.dto.*;
import com.exora.entity.HttpMethod;
import com.exora.entity.MockEndpoint;
import com.exora.exception.DuplicateEndpointException;
import com.exora.exception.ResourceNotFoundException;
import com.exora.repository.MockEndpointRepository;
import com.exora.repository.RequestLogRepository;
import com.exora.validation.JsonValidator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MockEndpointService {

    private final MockEndpointRepository endpointRepository;
    private final RequestLogRepository requestLogRepository;
    private final JsonValidator jsonValidator;

    @Value("${exora.base-url:http://localhost:8080}")
    private String baseUrl;

    public MockEndpointService(MockEndpointRepository endpointRepository,
                               RequestLogRepository requestLogRepository,
                               JsonValidator jsonValidator) {
        this.endpointRepository = endpointRepository;
        this.requestLogRepository = requestLogRepository;
        this.jsonValidator = jsonValidator;
    }

    private String normalizePath(String rawPath) {
        if (rawPath == null || rawPath.trim().isEmpty()) {
            return "/";
        }
        String path = rawPath.trim();
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
        if (path.length() > 1 && path.endsWith("/")) {
            path = path.substring(0, path.length() - 1);
        }
        return path;
    }

    @Transactional
    public MockEndpointResponseDto createEndpoint(MockEndpointRequestDto dto) {
        String normalizedPath = normalizePath(dto.getPath());
        dto.setPath(normalizedPath);

        if (endpointRepository.existsByHttpMethodAndPath(dto.getHttpMethod(), normalizedPath)) {
            throw new DuplicateEndpointException(
                    "An endpoint with method '" + dto.getHttpMethod() + "' and path '" + normalizedPath + "' already exists"
            );
        }

        jsonValidator.validateJson(dto.getResponseBody());

        MockEndpoint endpoint = new MockEndpoint(
                dto.getName().trim(),
                dto.getDescription() != null ? dto.getDescription().trim() : null,
                dto.getHttpMethod(),
                normalizedPath,
                dto.getStatusCode() != null ? dto.getStatusCode() : 200,
                dto.getResponseBody(),
                dto.getResponseHeaders(),
                dto.getDelayMs() != null ? dto.getDelayMs() : 0,
                dto.getEnabled() != null ? dto.getEnabled() : true
        );

        MockEndpoint saved = endpointRepository.save(endpoint);
        return mapToResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public MockEndpointResponseDto getEndpointById(Long id) {
        MockEndpoint endpoint = endpointRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mock endpoint not found with ID: " + id));
        return mapToResponseDto(endpoint);
    }

    @Transactional
    public MockEndpointResponseDto updateEndpoint(Long id, MockEndpointRequestDto dto) {
        MockEndpoint endpoint = endpointRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mock endpoint not found with ID: " + id));

        String normalizedPath = normalizePath(dto.getPath());
        dto.setPath(normalizedPath);

        if (endpointRepository.existsByHttpMethodAndPathAndIdNot(dto.getHttpMethod(), normalizedPath, id)) {
            throw new DuplicateEndpointException(
                    "An endpoint with method '" + dto.getHttpMethod() + "' and path '" + normalizedPath + "' already exists"
            );
        }

        jsonValidator.validateJson(dto.getResponseBody());

        endpoint.setName(dto.getName().trim());
        endpoint.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        endpoint.setHttpMethod(dto.getHttpMethod());
        endpoint.setPath(normalizedPath);
        endpoint.setStatusCode(dto.getStatusCode() != null ? dto.getStatusCode() : 200);
        endpoint.setResponseBody(dto.getResponseBody());
        endpoint.setResponseHeaders(dto.getResponseHeaders());
        endpoint.setDelayMs(dto.getDelayMs() != null ? dto.getDelayMs() : 0);
        if (dto.getEnabled() != null) {
            endpoint.setEnabled(dto.getEnabled());
        }

        MockEndpoint updated = endpointRepository.save(endpoint);
        return mapToResponseDto(updated);
    }

    @Transactional
    public void deleteEndpoint(Long id) {
        if (!endpointRepository.existsById(id)) {
            throw new ResourceNotFoundException("Mock endpoint not found with ID: " + id);
        }
        endpointRepository.deleteById(id);
    }

    @Transactional
    public MockEndpointResponseDto toggleEnabled(Long id, Boolean enabled) {
        MockEndpoint endpoint = endpointRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mock endpoint not found with ID: " + id));
        endpoint.setEnabled(enabled != null ? enabled : !endpoint.getEnabled());
        MockEndpoint updated = endpointRepository.save(endpoint);
        return mapToResponseDto(updated);
    }

    @Transactional(readOnly = true)
    public PageResponseDto<MockEndpointResponseDto> listEndpoints(String search, HttpMethod method, Boolean enabled, Pageable pageable) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<MockEndpoint> page = endpointRepository.findWithFilters(cleanSearch, method, enabled, pageable);

        return new PageResponseDto<>(
                page.getContent().stream().map(this::mapToResponseDto).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Transactional(readOnly = true)
    public EndpointStatsDto getEndpointStats(Long id) {
        if (!endpointRepository.existsById(id)) {
            throw new ResourceNotFoundException("Mock endpoint not found with ID: " + id);
        }
        long total = requestLogRepository.countByEndpointId(id);

        EndpointStatsDto stats = new EndpointStatsDto();
        stats.setEndpointId(id);
        stats.setTotalRequests(total);
        return stats;
    }

    public MockEndpointResponseDto mapToResponseDto(MockEndpoint endpoint) {
        MockEndpointResponseDto dto = new MockEndpointResponseDto();
        dto.setId(endpoint.getId());
        dto.setName(endpoint.getName());
        dto.setDescription(endpoint.getDescription());
        dto.setHttpMethod(endpoint.getHttpMethod());
        dto.setPath(endpoint.getPath());
        dto.setStatusCode(endpoint.getStatusCode());
        dto.setResponseBody(endpoint.getResponseBody());
        dto.setResponseHeaders(endpoint.getResponseHeaders());
        dto.setDelayMs(endpoint.getDelayMs());
        dto.setEnabled(endpoint.getEnabled());
        dto.setCreatedAt(endpoint.getCreatedAt());
        dto.setUpdatedAt(endpoint.getUpdatedAt());
        dto.setMockUrl(baseUrl + "/mock" + endpoint.getPath());
        dto.setRequestCount(requestLogRepository.countByEndpointId(endpoint.getId()));
        return dto;
    }
}
