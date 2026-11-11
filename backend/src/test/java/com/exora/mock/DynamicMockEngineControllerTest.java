package com.exora.mock;

import com.exora.entity.HttpMethod;
import com.exora.entity.MockEndpoint;
import com.exora.repository.MockEndpointRepository;
import com.exora.service.RequestLogService;
import com.exora.validation.SafeHeaderHelper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DynamicMockEngineControllerTest {

    @Mock
    private MockEndpointRepository endpointRepository;

    @Mock
    private RequestLogService requestLogService;

    private SafeHeaderHelper safeHeaderHelper;
    private DynamicMockEngineController mockEngineController;

    @BeforeEach
    void setUp() {
        safeHeaderHelper = new SafeHeaderHelper(new ObjectMapper());
        mockEngineController = new DynamicMockEngineController(endpointRepository, requestLogService, safeHeaderHelper);
    }

    @Test
    @DisplayName("Should return configured JSON response when endpoint matches")
    void testMockEngineReturnsConfiguredResponse() {
        MockEndpoint endpoint = new MockEndpoint(
                "Products API", "Get products", HttpMethod.GET, "/api/products", 200,
                "{\"products\": [{\"id\": 1, \"name\": \"Laptop\"}]}",
                "{\"X-Server\": \"Exora-Mock\"}",
                0, true
        );
        endpoint.setId(10L);

        when(endpointRepository.findByHttpMethodAndPath(HttpMethod.GET, "/api/products"))
                .thenReturn(Optional.of(endpoint));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("GET");
        request.setRequestURI("/mock/api/products");

        ResponseEntity<?> response = mockEngineController.handleMockRequest(request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("{\"products\": [{\"id\": 1, \"name\": \"Laptop\"}]}", response.getBody());
        assertTrue(response.getHeaders().containsKey("X-Server"));
        assertEquals("Exora-Mock", response.getHeaders().getFirst("X-Server"));

        verify(requestLogService, times(1)).recordLog(
                eq(endpoint), eq("GET"), eq("/api/products"), eq(200),
                anyLong(), eq("SUCCESS"), anyString(), anyString(),
                anyString(), anyString(), isNull()
        );
    }

    @Test
    @DisplayName("Should return 404 when route is unknown")
    void testMockEngineRouteNotFoundReturns404() {
        when(endpointRepository.findByHttpMethodAndPath(HttpMethod.GET, "/api/unknown"))
                .thenReturn(Optional.empty());

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("GET");
        request.setRequestURI("/mock/api/unknown");

        ResponseEntity<?> response = mockEngineController.handleMockRequest(request);

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());

        verify(requestLogService, times(1)).recordLog(
                isNull(), eq("GET"), eq("/api/unknown"), eq(404),
                anyLong(), eq("NOT_FOUND"), anyString(), anyString(),
                isNull(), isNull(), anyString()
        );
    }

    @Test
    @DisplayName("Should return 403 when endpoint is disabled")
    void testMockEngineDisabledEndpointReturns403() {
        MockEndpoint endpoint = new MockEndpoint(
                "Disabled API", null, HttpMethod.POST, "/api/orders", 201, "{\"status\": \"created\"}", null, 0, false
        );
        endpoint.setId(12L);

        when(endpointRepository.findByHttpMethodAndPath(HttpMethod.POST, "/api/orders"))
                .thenReturn(Optional.of(endpoint));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("POST");
        request.setRequestURI("/mock/api/orders");

        ResponseEntity<?> response = mockEngineController.handleMockRequest(request);

        assertNotNull(response);
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());

        verify(requestLogService, times(1)).recordLog(
                eq(endpoint), eq("POST"), eq("/api/orders"), eq(403),
                anyLong(), eq("DISABLED"), anyString(), anyString(),
                isNull(), isNull(), anyString()
        );
    }

    @Test
    @DisplayName("Should sanitize sensitive headers in request metadata")
    void testMockEngineRedactsSensitiveHeaders() {
        MockEndpoint endpoint = new MockEndpoint(
                "Secure API", null, HttpMethod.GET, "/api/user/profile", 200, "{\"id\": 1}", null, 0, true
        );
        endpoint.setId(14L);

        when(endpointRepository.findByHttpMethodAndPath(HttpMethod.GET, "/api/user/profile"))
                .thenReturn(Optional.of(endpoint));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("GET");
        request.setRequestURI("/mock/api/user/profile");
        request.addHeader("Authorization", "Bearer sensitive-token-12345");
        request.addHeader("Cookie", "session=abcdef; tracking=123");
        request.addHeader("X-Custom-Client", "ExoraTester/1.0");

        mockEngineController.handleMockRequest(request);

        verify(requestLogService, times(1)).recordLog(
                eq(endpoint), eq("GET"), eq("/api/user/profile"), eq(200),
                anyLong(), eq("SUCCESS"),
                argThat(meta -> meta.contains("[REDACTED]") && !meta.contains("sensitive-token-12345") && !meta.contains("session=abcdef")),
                anyString(), anyString(), anyString(), isNull()
        );
    }
}
