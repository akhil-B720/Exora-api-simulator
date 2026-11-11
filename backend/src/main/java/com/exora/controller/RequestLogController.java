package com.exora.controller;

import com.exora.dto.PageResponseDto;
import com.exora.dto.RequestLogDto;
import com.exora.service.RequestLogService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/requests")
public class RequestLogController {

    private final RequestLogService requestLogService;

    public RequestLogController(RequestLogService requestLogService) {
        this.requestLogService = requestLogService;
    }

    @GetMapping
    public ResponseEntity<PageResponseDto<RequestLogDto>> listRequests(
            @RequestParam(required = false) String method,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long endpointId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort);

        PageResponseDto<RequestLogDto> response = requestLogService.listRequests(method, status, endpointId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RequestLogDto> getRequestById(@PathVariable Long id) {
        RequestLogDto log = requestLogService.getRequestById(id);
        return ResponseEntity.ok(log);
    }
}
