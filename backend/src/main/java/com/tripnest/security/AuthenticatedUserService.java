package com.tripnest.security;

import com.tripnest.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Utility service to extract the currently authenticated user's ID
 * from the Spring Security Context.
 */
@Service
public class AuthenticatedUserService {

    /**
     * Retrieves the UUID of the currently authenticated Supabase user.
     * The UUID is extracted from the 'sub' claim of the JWT.
     *
     * @return UUID of the current user
     * @throws UnauthorizedException if no authentication is found or it is invalid
     */
    public UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Not authenticated");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof Jwt jwt) {
            try {
                return UUID.fromString(jwt.getSubject());
            } catch (IllegalArgumentException e) {
                throw new UnauthorizedException("Invalid user ID in token");
            }
        }

        throw new UnauthorizedException("Invalid authentication token type");
    }
}
