package com.tripnest.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * CORS configuration.
 *
 * Allows the React Vite dev server (http://localhost:5173) to communicate
 * with the Spring Boot API (http://localhost:8080).
 *
 * In production, replace the allowed origin with the deployed frontend URL.
 */
@Configuration
public class WebConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // React Vite dev server origin
        config.setAllowedOrigins(List.of("http://localhost:5173"));

        // Standard HTTP methods used by the REST API
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Allow all headers (including Authorization for JWT in future phases)
        config.setAllowedHeaders(List.of("*"));

        // Allow credentials (cookies, auth headers)
        config.setAllowCredentials(true);

        // Cache preflight response for 1 hour
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
