package com.tripnest.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** Thrown when an unauthenticated request attempts a protected operation. Maps to HTTP 401. */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
    public UnauthorizedException() {
        super("Authentication required");
    }
}
