package com.exora.validation;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class SafeHeaderHelper {

    private final ObjectMapper objectMapper;

    private static final Set<String> SENSITIVE_HEADERS = Set.of(
            "authorization",
            "cookie",
            "set-cookie",
            "proxy-authorization",
            "x-api-key",
            "api-key"
    );

    private static final Set<String> HOP_BY_HOP_HEADERS = Set.of(
            "connection",
            "keep-alive",
            "proxy-authenticate",
            "proxy-authorization",
            "te",
            "trailers",
            "transfer-encoding",
            "upgrade"
    );

    public SafeHeaderHelper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public Map<String, String> sanitizeHeaders(Map<String, String> rawHeaders) {
        if (rawHeaders == null) {
            return Collections.emptyMap();
        }
        Map<String, String> sanitized = new LinkedHashMap<>();
        for (Map.Entry<String, String> entry : rawHeaders.entrySet()) {
            String key = entry.getKey();
            if (key != null) {
                String lowerKey = key.toLowerCase(Locale.ROOT);
                if (SENSITIVE_HEADERS.contains(lowerKey)) {
                    sanitized.put(key, "[REDACTED]");
                } else {
                    sanitized.put(key, entry.getValue());
                }
            }
        }
        return sanitized;
    }

    public Map<String, String> parseAndFilterResponseHeaders(String responseHeadersJson) {
        if (responseHeadersJson == null || responseHeadersJson.trim().isEmpty()) {
            return Collections.emptyMap();
        }
        try {
            Map<String, String> headers = objectMapper.readValue(
                    responseHeadersJson,
                    new TypeReference<Map<String, String>>() {}
            );
            Map<String, String> validHeaders = new LinkedHashMap<>();
            for (Map.Entry<String, String> entry : headers.entrySet()) {
                String key = entry.getKey();
                if (key != null && !key.trim().isEmpty()) {
                    String lowerKey = key.toLowerCase(Locale.ROOT).trim();
                    if (!HOP_BY_HOP_HEADERS.contains(lowerKey)) {
                        validHeaders.put(key.trim(), entry.getValue());
                    }
                }
            }
            return validHeaders;
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    public String toJson(Object obj) {
        if (obj == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }
}
