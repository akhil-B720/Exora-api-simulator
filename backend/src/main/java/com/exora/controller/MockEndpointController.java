package com.exora.controller;

import com.exora.dto.*;
import com.exora.entity.HttpMethod;
import com.exora.service.MockEndpointService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mock-endpoints")
public class MockEndpointController {

    private final MockEndpointService endpointService;

    public MockEndpointController(MockEndpointService endpointService) {
        this.endpointService = endpointService;
    }

    @PostMapping
    public ResponseEntity<MockEndpointResponseDto> createEndpoint(@Valid @RequestBody MockEndpointRequestDto requestDto) {
        MockEndpointResponseDto created = endpointService.createEndpoint(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<PageResponseDto<MockEndpointResponseDto>> listEndpoints(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) HttpMethod method,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort);

        PageResponseDto<MockEndpointResponseDto> response = endpointService.listEndpoints(search, method, enabled, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MockEndpointResponseDto> getEndpoint(@PathVariable Long id) {
        MockEndpointResponseDto endpoint = endpointService.getEndpointById(id);
        return ResponseEntity.ok(endpoint);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MockEndpointResponseDto> updateEndpoint(
            @PathVariable Long id,
            @Valid @RequestBody MockEndpointRequestDto requestDto) {
        MockEndpointResponseDto updated = endpointService.updateEndpoint(id, requestDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEndpoint(@PathVariable Long id) {
        endpointService.deleteEndpoint(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/enabled")
    public ResponseEntity<MockEndpointResponseDto> toggleEnabled(
            @PathVariable Long id,
            @RequestBody(required = false) MockEndpointToggleDto toggleDto) {
        Boolean enabled = toggleDto != null ? toggleDto.getEnabled() : null;
        MockEndpointResponseDto updated = endpointService.toggleEnabled(id, enabled);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<EndpointStatsDto> getEndpointStats(@PathVariable Long id) {
        EndpointStatsDto stats = endpointService.getEndpointStats(id);
        return ResponseEntity.ok(stats);
    }
}
