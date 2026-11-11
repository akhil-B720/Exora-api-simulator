package com.exora.repository;

import com.exora.entity.RequestLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestLogRepository extends JpaRepository<RequestLog, Long> {

    Page<RequestLog> findByEndpointId(Long endpointId, Pageable pageable);

    long countByEndpointId(Long endpointId);

    long countByOutcome(String outcome);

    long countByResponseStatusBetween(int minStatus, int maxStatus);

    @Query("SELECT r FROM RequestLog r WHERE " +
           "(:method IS NULL OR r.httpMethod = :method) AND " +
           "(:status IS NULL OR r.responseStatus = :status) AND " +
           "(:endpointId IS NULL OR (r.endpoint IS NOT NULL AND r.endpoint.id = :endpointId))")
    Page<RequestLog> findWithFilters(
            @Param("method") String method,
            @Param("status") Integer status,
            @Param("endpointId") Long endpointId,
            Pageable pageable);

    @Query("SELECT r.responseStatus, COUNT(r) FROM RequestLog r GROUP BY r.responseStatus ORDER BY COUNT(r) DESC")
    List<Object[]> getStatusCodeDistribution();

    @Query("SELECT r FROM RequestLog r ORDER BY r.timestamp DESC")
    List<RequestLog> findTopRecent(Pageable pageable);
}
