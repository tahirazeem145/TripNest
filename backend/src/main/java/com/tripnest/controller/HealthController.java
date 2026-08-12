package com.tripnest.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Health check endpoint.
 *
 * GET /api/health
 * Response: { "status": "UP", "application": "TripNest" }
 *
 * Used to verify the Spring Boot server is running correctly.
 * Does NOT require authentication.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "application", "TripNest"
        ));
    }
}
