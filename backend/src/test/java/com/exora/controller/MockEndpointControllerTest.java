package com.exora.controller;

import com.exora.dto.MockEndpointRequestDto;
import com.exora.dto.MockEndpointResponseDto;
import com.exora.entity.HttpMethod;
import com.exora.service.MockEndpointService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MockEndpointController.class)
class MockEndpointControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MockEndpointService endpointService;

    @Test
    @DisplayName("POST /api/mock-endpoints should return 201 Created with valid body")
    void testCreateEndpointControllerSuccess() throws Exception {
        MockEndpointRequestDto request = new MockEndpointRequestDto(
                "Health Mock",
                "Service health simulation",
                HttpMethod.GET,
                "/api/health-check",
                200,
                "{\"status\": \"UP\"}",
                null,
                0,
                true
        );

        MockEndpointResponseDto response = new MockEndpointResponseDto();
        response.setId(100L);
        response.setName("Health Mock");
        response.setHttpMethod(HttpMethod.GET);
        response.setPath("/api/health-check");
        response.setStatusCode(200);
        response.setResponseBody("{\"status\": \"UP\"}");
        response.setEnabled(true);

        when(endpointService.createEndpoint(any(MockEndpointRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/mock-endpoints")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.name").value("Health Mock"))
                .andExpect(jsonPath("$.statusCode").value(200));
    }

    @Test
    @DisplayName("POST /api/mock-endpoints should return 400 Bad Request when path is invalid")
    void testCreateEndpointInvalidPathReturns400() throws Exception {
        MockEndpointRequestDto invalidRequest = new MockEndpointRequestDto(
                "Invalid Path",
                null,
                HttpMethod.GET,
                "invalid-path-without-slash",
                200,
                "{}",
                null,
                0,
                true
        );

        mockMvc.perform(post("/api/mock-endpoints")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }
}
