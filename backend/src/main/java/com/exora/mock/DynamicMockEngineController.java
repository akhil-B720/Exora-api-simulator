package com.exora.mock;

import com.exora.dto.ErrorResponseDto;
import com.exora.entity.HttpMethod;
import com.exora.entity.MockEndpoint;
import com.exora.repository.MockEndpointRepository;
import com.exora.service.RequestLogService;
import com.exora.validation.SafeHeaderHelper;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
public class DynamicMockEngineController {

    private static final Logger log = LoggerFactory.getLogger(DynamicMockEngineController.class);

    private final MockEndpointRepository endpointRepository;
    private final RequestLogService requestLogService;
    private final SafeHeaderHelper safeHeaderHelper;

    public DynamicMockEngineController(MockEndpointRepository endpointRepository,
                                       RequestLogService requestLogService,
                                       SafeHeaderHelper safeHeaderHelper) {
        this.endpointRepository = endpointRepository;
        this.requestLogService = requestLogService;
        this.safeHeaderHelper = safeHeaderHelper;
    }

    @RequestMapping(value = "/mock/**")
    public ResponseEntity<?> handleMockRequest(HttpServletRequest request) {
        long startTime = System.currentTimeMillis();
        String methodStr = request.getMethod().toUpperCase(Locale.ROOT);
        String fullUri = request.getRequestURI();

        // Extract sub-path following /mock
        String mockPath = fullUri.startsWith("/mock") ? fullUri.substring(5) : fullUri;
        if (!mockPath.startsWith("/")) {
            mockPath = "/" + mockPath;
        }

        // Read and cap request body (max 256KB for safety)
        String requestBody = "";
        try {
            byte[] bodyBytes = StreamUtils.copyToByteArray(request.getInputStream());
            if (bodyBytes.length > 0) {
                int lengthToRead = Math.min(bodyBytes.length, 256 * 1024);
                requestBody = new String(bodyBytes, 0, lengthToRead, StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            log.warn("Could not read request body: {}", e.getMessage());
        }

        // Extract safe request headers and metadata
        Map<String, String> rawHeaders = new LinkedHashMap<>();
        Enumeration<String> headerNames = request.getHeaderNames();
        if (headerNames != null) {
            while (headerNames.hasMoreElements()) {
                String name = headerNames.nextElement();
                rawHeaders.put(name, request.getHeader(name));
            }
        }
        Map<String, String> safeHeaders = safeHeaderHelper.sanitizeHeaders(rawHeaders);

        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("headers", safeHeaders);
        metadata.put("queryString", request.getQueryString());
        metadata.put("remoteAddr", request.getRemoteAddr());
        metadata.put("userAgent", request.getHeader("User-Agent"));
        String metadataJson = safeHeaderHelper.toJson(metadata);

        // Convert HTTP Method
        HttpMethod httpMethod;
        try {
            httpMethod = HttpMethod.valueOf(methodStr);
        } catch (IllegalArgumentException e) {
            long duration = System.currentTimeMillis() - startTime;
            requestLogService.recordLog(
                    null, methodStr, mockPath, HttpStatus.METHOD_NOT_ALLOWED.value(),
                    duration, "METHOD_NOT_ALLOWED", metadataJson, requestBody, null, null,
                    "Unsupported HTTP method: " + methodStr
            );
            return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ErrorResponseDto(
                            HttpStatus.METHOD_NOT_ALLOWED.value(),
                            "Method Not Allowed",
                            "Method '" + methodStr + "' is not supported by the mock engine",
                            fullUri
                    ));
        }

        // Lookup matching endpoint
        Optional<MockEndpoint> matchedEndpoint = endpointRepository.findByHttpMethodAndPath(httpMethod, mockPath);

        if (matchedEndpoint.isEmpty()) {
            long duration = System.currentTimeMillis() - startTime;
            requestLogService.recordLog(
                    null, methodStr, mockPath, HttpStatus.NOT_FOUND.value(),
                    duration, "NOT_FOUND", metadataJson, requestBody, null, null,
                    "No mock endpoint found matching " + methodStr + " " + mockPath
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ErrorResponseDto(
                            HttpStatus.NOT_FOUND.value(),
                            "Not Found",
                            "No mock endpoint configured for method " + methodStr + " and path " + mockPath,
                            fullUri
                    ));
        }

        MockEndpoint endpoint = matchedEndpoint.get();

        // Check if enabled
        if (Boolean.FALSE.equals(endpoint.getEnabled())) {
            long duration = System.currentTimeMillis() - startTime;
            requestLogService.recordLog(
                    endpoint, methodStr, mockPath, HttpStatus.FORBIDDEN.value(),
                    duration, "DISABLED", metadataJson, requestBody, null, null,
                    "Mock endpoint " + methodStr + " " + mockPath + " is disabled"
            );
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ErrorResponseDto(
                            HttpStatus.FORBIDDEN.value(),
                            "Forbidden",
                            "The mock endpoint for " + methodStr + " " + mockPath + " is currently disabled",
                            fullUri
                    ));
        }

        // Apply delay up to 10,000ms max
        int delayMs = endpoint.getDelayMs() != null ? Math.min(Math.max(endpoint.getDelayMs(), 0), 10000) : 0;
        if (delayMs > 0) {
            try {
                Thread.sleep(delayMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Mock delay interrupted for {}", mockPath);
            }
        }

        // Prepare response
        int statusCode = endpoint.getStatusCode() != null ? endpoint.getStatusCode() : 200;
        String responseBody = endpoint.getResponseBody() != null ? endpoint.getResponseBody() : "";

        HttpHeaders responseHeaders = new HttpHeaders();
        Map<String, String> configuredHeaders = safeHeaderHelper.parseAndFilterResponseHeaders(endpoint.getResponseHeaders());
        for (Map.Entry<String, String> entry : configuredHeaders.entrySet()) {
            responseHeaders.add(entry.getKey(), entry.getValue());
        }

        // Set default Content-Type if not explicitly configured
        if (!responseHeaders.containsKey(HttpHeaders.CONTENT_TYPE)) {
            String trimmedBody = responseBody.trim();
            if ((trimmedBody.startsWith("{") && trimmedBody.endsWith("}")) ||
                (trimmedBody.startsWith("[") && trimmedBody.endsWith("]"))) {
                responseHeaders.setContentType(MediaType.APPLICATION_JSON);
            } else if (!trimmedBody.isEmpty()) {
                responseHeaders.setContentType(MediaType.TEXT_PLAIN);
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        String outcome = (statusCode < 400) ? "SUCCESS" : (statusCode < 500 ? "CLIENT_ERROR" : "SERVER_ERROR");

        // Record request log in database
        requestLogService.recordLog(
                endpoint,
                methodStr,
                mockPath,
                statusCode,
                duration,
                outcome,
                metadataJson,
                requestBody,
                responseBody,
                safeHeaderHelper.toJson(configuredHeaders),
                null
        );

        return ResponseEntity.status(statusCode)
                .headers(responseHeaders)
                .body(responseBody);
    }
}
