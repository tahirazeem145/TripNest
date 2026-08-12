package com.tripnest;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * TripNest Spring Boot Application Entry Point.
 *
 * Architecture:
 *   React + Vite  →  Spring Boot REST API  →  Supabase PostgreSQL
 *
 * Phase 1: Project bootstrap + health endpoint.
 * Authentication: Supabase Auth JWT (validated by Spring Security in Phase 10).
 */
@SpringBootApplication
public class TripNestApplication {

    public static void main(String[] args) {
        // Load .env file from the backend directory into system properties
        // so Spring Boot's ${VAR} placeholders work correctly.
        loadDotEnv();
        SpringApplication.run(TripNestApplication.class, args);
    }

    private static void loadDotEnv() {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .ignoreIfMissing()   // don't crash if .env is absent (e.g. CI/CD)
                    .load();
            dotenv.entries().forEach(entry ->
                    System.setProperty(entry.getKey(), entry.getValue())
            );
        } catch (Exception e) {
            System.out.println("[TripNest] .env not loaded: " + e.getMessage());
        }
    }
}
