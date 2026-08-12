package com.tripnest.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security configuration — Phase 1 (Bootstrap).
 *
 * In Phase 1, all API endpoints are publicly accessible so we can verify
 * the Spring Boot server works before implementing JWT authentication.
 *
 * Phase 10 will replace this with full Supabase JWT validation:
 *   - Extract Bearer token from Authorization header
 *   - Validate against Supabase JWT secret (HS256)
 *   - Map user_id claim to Spring Security principal
 *   - Enforce authentication on all endpoints except /api/health
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Apply CORS configuration defined in WebConfig
            .cors(cors -> cors.configure(http))

            // Disable CSRF — stateless REST API, no session cookies
            .csrf(AbstractHttpConfigurer::disable)

            // Stateless: no HTTP session — JWT will carry all state in Phase 10
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Phase 1: permit all requests (no JWT validation yet)
            .authorizeHttpRequests(auth -> auth
                    .anyRequest().permitAll()
            );

        return http.build();
    }
}
