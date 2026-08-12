/**
 * Spring Security components.
 *
 * Phase 10 will add:
 *   - JwtAuthenticationFilter: reads Authorization header, validates Supabase JWT
 *   - JwtTokenProvider: wraps JWT validation logic using Supabase JWT secret (HS256)
 *   - SecurityUtils: helpers for extracting principal from SecurityContext
 *
 * Strategy: Keep Supabase Auth as identity provider.
 * Spring Security validates the JWT issued by Supabase on every request.
 * No separate user store or password management needed.
 */
package com.tripnest.security;
