package com.tripnest.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.stream.Collectors;

/**
 * Centralized exception handler for all REST controllers.
 *
 * Converts exceptions into consistent {@link ApiError} JSON responses.
 * Controllers should throw domain-specific exceptions; this class handles
 * the mapping to HTTP responses.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ----------------------------------------------------------------
    // 400 Bad Request — Validation failures
    // ----------------------------------------------------------------

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));

        return buildResponse(HttpStatus.BAD_REQUEST, message, request.getRequestURI());
    }

    // ----------------------------------------------------------------
    // 400 Bad Request — Illegal arguments
    // ----------------------------------------------------------------

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request) {

        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
    }

    // ----------------------------------------------------------------
    // 401 Unauthorized
    // ----------------------------------------------------------------

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiError> handleUnauthorized(
            UnauthorizedException ex,
            HttpServletRequest request) {

        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), request.getRequestURI());
    }

    // ----------------------------------------------------------------
    // 403 Forbidden
    // ----------------------------------------------------------------

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleForbidden(
            AccessDeniedException ex,
            HttpServletRequest request) {

        return buildResponse(HttpStatus.FORBIDDEN, "Access denied", request.getRequestURI());
    }

    // ----------------------------------------------------------------
    // 404 Not Found
    // ----------------------------------------------------------------

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(
            ResourceNotFoundException ex,
            HttpServletRequest request) {

        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI());
    }

    // ----------------------------------------------------------------
    // 409 Conflict
    // ----------------------------------------------------------------

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiError> handleConflict(
            ConflictException ex,
            HttpServletRequest request) {

        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI());
    }

    // ----------------------------------------------------------------
    // 500 Internal Server Error — catch-all
    // ----------------------------------------------------------------

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(
            Exception ex,
            HttpServletRequest request) {

        log.error("Unhandled exception at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred",
                request.getRequestURI()
        );
    }

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------

    private ResponseEntity<ApiError> buildResponse(HttpStatus status, String message, String path) {
        ApiError error = ApiError.builder()
                .timestamp(Instant.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(path)
                .build();
        return ResponseEntity.status(status).body(error);
    }
}
