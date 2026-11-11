package com.exora.repository;

import com.exora.entity.HttpMethod;
import com.exora.entity.MockEndpoint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MockEndpointRepository extends JpaRepository<MockEndpoint, Long> {

    Optional<MockEndpoint> findByHttpMethodAndPath(HttpMethod httpMethod, String path);

    boolean existsByHttpMethodAndPath(HttpMethod httpMethod, String path);

    boolean existsByHttpMethodAndPathAndIdNot(HttpMethod httpMethod, String path, Long id);

    long countByEnabledTrue();

    long countByEnabledFalse();

    @Query("SELECT e FROM MockEndpoint e WHERE " +
           "(:search IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.path) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:method IS NULL OR e.httpMethod = :method) AND " +
           "(:enabled IS NULL OR e.enabled = :enabled)")
    Page<MockEndpoint> findWithFilters(
            @Param("search") String search,
            @Param("method") HttpMethod method,
            @Param("enabled") Boolean enabled,
            Pageable pageable);
}
