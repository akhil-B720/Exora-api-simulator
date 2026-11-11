package com.exora.controller;

import com.exora.dto.DashboardStatsDto;
import com.exora.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final DataSource dataSource;
    private final DashboardService dashboardService;

    public HealthController(DataSource dataSource, DashboardService dashboardService) {
        this.dataSource = dataSource;
        this.dashboardService = dashboardService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("service", "exora-backend");
        health.put("version", "1.0.0");
        health.put("timestamp", LocalDateTime.now());

        Map<String, Object> dbHealth = new LinkedHashMap<>();
        try (Connection connection = dataSource.getConnection()) {
            boolean valid = connection.isValid(2);
            if (valid) {
                DatabaseMetaData metaData = connection.getMetaData();
                dbHealth.put("status", "CONNECTED");
                dbHealth.put("databaseProductName", metaData.getDatabaseProductName());
                dbHealth.put("databaseProductVersion", metaData.getDatabaseProductVersion());
            } else {
                dbHealth.put("status", "DISCONNECTED");
            }
        } catch (Exception e) {
            dbHealth.put("status", "UNAVAILABLE");
            dbHealth.put("error", "Database connection verification failed");
        }
        health.put("database", dbHealth);

        return ResponseEntity.ok(health);
    }

    @GetMapping("/stats/overview")
    public ResponseEntity<DashboardStatsDto> getOverviewStats() {
        DashboardStatsDto stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}
