package com.exora.service;

import com.exora.dto.MockEndpointRequestDto;
import com.exora.dto.MockEndpointResponseDto;
import com.exora.entity.HttpMethod;
import com.exora.entity.MockEndpoint;
import com.exora.exception.DuplicateEndpointException;
import com.exora.exception.InvalidJsonException;
import com.exora.exception.ResourceNotFoundException;
import com.exora.repository.MockEndpointRepository;
import com.exora.repository.RequestLogRepository;
import com.exora.validation.JsonValidator;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MockEndpointServiceTest {

    @Mock
    private MockEndpointRepository endpointRepository;

    @Mock
    private RequestLogRepository requestLogRepository;

    private JsonValidator jsonValidator;
    private MockEndpointService endpointService;

    @BeforeEach
    void setUp() {
        jsonValidator = new JsonValidator(new ObjectMapper());
        endpointService = new MockEndpointService(endpointRepository, requestLogRepository, jsonValidator);
    }

    @Test
    @DisplayName("Should create mock endpoint successfully with valid data")
    void testCreateEndpointSuccess() {
        MockEndpointRequestDto request = new MockEndpointRequestDto(
                "Product List API",
                "Returns mock product catalog",
                HttpMethod.GET,
                "/api/products",
                200,
                "{\"products\": [{\"id\": 1, \"name\": \"Laptop\"}]}",
                "{\"X-Custom-Header\": \"ExoraMock\"}",
                50,
                true
        );

        when(endpointRepository.existsByHttpMethodAndPath(HttpMethod.GET, "/api/products")).thenReturn(false);

        MockEndpoint savedEndpoint = new MockEndpoint(
                request.getName(),
                request.getDescription(),
                request.getHttpMethod(),
                request.getPath(),
                request.getStatusCode(),
                request.getResponseBody(),
                request.getResponseHeaders(),
                request.getDelayMs(),
                request.getEnabled()
        );
        savedEndpoint.setId(1L);

        when(endpointRepository.save(any(MockEndpoint.class))).thenReturn(savedEndpoint);
        when(requestLogRepository.countByEndpointId(1L)).thenReturn(0L);

        MockEndpointResponseDto response = endpointService.createEndpoint(request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Product List API", response.getName());
        assertEquals(HttpMethod.GET, response.getHttpMethod());
        assertEquals("/api/products", response.getPath());
        assertEquals(200, response.getStatusCode());
        verify(endpointRepository, times(1)).save(any(MockEndpoint.class));
    }

    @Test
    @DisplayName("Should throw DuplicateEndpointException when method and path already exist")
    void testCreateEndpointDuplicateThrowsException() {
        MockEndpointRequestDto request = new MockEndpointRequestDto(
                "Duplicate API",
                null,
                HttpMethod.GET,
                "/api/users",
                200,
                "{}",
                null,
                0,
                true
        );

        when(endpointRepository.existsByHttpMethodAndPath(HttpMethod.GET, "/api/users")).thenReturn(true);

        assertThrows(DuplicateEndpointException.class, () -> endpointService.createEndpoint(request));
        verify(endpointRepository, never()).save(any(MockEndpoint.class));
    }

    @Test
    @DisplayName("Should throw InvalidJsonException when response body contains malformed JSON")
    void testCreateEndpointInvalidJsonThrowsException() {
        MockEndpointRequestDto request = new MockEndpointRequestDto(
                "Malformed API",
                null,
                HttpMethod.POST,
                "/api/orders",
                201,
                "{invalid_json: 123",
                null,
                0,
                true
        );

        when(endpointRepository.existsByHttpMethodAndPath(HttpMethod.POST, "/api/orders")).thenReturn(false);

        assertThrows(InvalidJsonException.class, () -> endpointService.createEndpoint(request));
        verify(endpointRepository, never()).save(any(MockEndpoint.class));
    }

    @Test
    @DisplayName("Should toggle enabled state")
    void testToggleEnabled() {
        MockEndpoint endpoint = new MockEndpoint(
                "Toggle API", null, HttpMethod.GET, "/api/status", 200, "{}", null, 0, true
        );
        endpoint.setId(5L);

        when(endpointRepository.findById(5L)).thenReturn(Optional.of(endpoint));
        when(endpointRepository.save(any(MockEndpoint.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MockEndpointResponseDto result = endpointService.toggleEnabled(5L, false);

        assertFalse(result.getEnabled());
        verify(endpointRepository, times(1)).save(endpoint);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when toggling non-existent endpoint")
    void testToggleNonExistentThrows() {
        when(endpointRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> endpointService.toggleEnabled(999L, true));
    }
}
