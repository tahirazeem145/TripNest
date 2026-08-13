package com.tripnest.controller;

import com.tripnest.dto.ProfileResponse;
import com.tripnest.dto.UpdateProfileRequest;
import com.tripnest.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for Profile endpoints.
 * Handles HTTP requests, delegates logic to ProfileService, and returns DTO responses.
 */
@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    /**
     * GET /api/profiles
     * Returns list of all profiles.
     */
    @GetMapping
    public ResponseEntity<List<ProfileResponse>> getAllProfiles() {
        return ResponseEntity.ok(profileService.getAllProfiles());
    }

    /**
     * GET /api/profiles/{userId}
     * Returns a single profile by UUID.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponse> getProfile(@PathVariable UUID userId) {
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    /**
     * GET /api/profiles/email/{email}
     * Returns a single profile by email address.
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<ProfileResponse> getProfileByEmail(@PathVariable String email) {
        return ResponseEntity.ok(profileService.getProfileByEmail(email));
    }

    /**
     * PUT /api/profiles/{userId}
     * Updates an existing profile's editable fields.
     */
    @PutMapping("/{userId}")
    public ResponseEntity<ProfileResponse> updateProfile(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(userId, request));
    }
}
