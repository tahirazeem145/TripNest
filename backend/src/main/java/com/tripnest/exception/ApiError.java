package com.tripnest.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Standard API error response body.
 *
 * Returned by GlobalExceptionHandler for all error conditions.
 *
 * Example:
 * {
 *   "timestamp": "2024-08-12T15:00:00Z",
 *   "status": 404,
 *   "error": "Not Found",
 *   "message": "Post not found",
 *   "path": "/api/posts/abc-123"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiError {

    /** ISO-8601 timestamp of when the error occurred */
    private Instant timestamp;

    /** HTTP status code (e.g. 400, 401, 404, 500) */
    private int status;

    /** HTTP status reason phrase (e.g. "Bad Request", "Not Found") */
    private String error;

    /** Human-readable error message */
    private String message;

    /** Request path that triggered the error */
    private String path;
}
