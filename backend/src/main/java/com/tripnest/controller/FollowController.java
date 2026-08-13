package com.tripnest.controller;

import com.tripnest.dto.CreateFollowRequest;
import com.tripnest.dto.FollowResponse;
import com.tripnest.dto.FollowStatusResponse;
import com.tripnest.dto.FollowWithProfileResponse;
import com.tripnest.service.FollowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for managing follow relationships.
 */
@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;
    private final com.tripnest.security.AuthenticatedUserService authenticatedUserService;

    /**
     * POST /api/follows
     * Creates a follow relationship. Authenticated user ID overrides followerId.
     */
    @PostMapping
    public ResponseEntity<FollowResponse> followUser(@Valid @RequestBody CreateFollowRequest request) {
        UUID authenticatedUserId = authenticatedUserService.getCurrentUserId();
        FollowResponse response = followService.followUser(authenticatedUserId, request.getFollowingId());
        // Use 200 OK or 201 Created. Using 201 here.
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * DELETE /api/follows
     * Unfollows a user. Authenticated user ID overrides followerId.
     * Expects parameters: ?followerId=...&followingId=...
     */
    @DeleteMapping
    public ResponseEntity<Void> unfollowUser(
            @RequestParam(required = false) UUID followerId, // Kept for backwards compatibility but ignored
            @RequestParam UUID followingId) {
        UUID authenticatedUserId = authenticatedUserService.getCurrentUserId();
        followService.unfollowUser(authenticatedUserId, followingId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/follows/followers/{userId}
     * Returns the user's followers with their profile information.
     */
    @GetMapping("/followers/{userId}")
    public ResponseEntity<List<FollowWithProfileResponse>> getFollowers(@PathVariable UUID userId) {
        return ResponseEntity.ok(followService.getFollowers(userId));
    }

    /**
     * GET /api/follows/following/{userId}
     * Returns the accounts the user follows with their profile information.
     */
    @GetMapping("/following/{userId}")
    public ResponseEntity<List<FollowWithProfileResponse>> getFollowing(@PathVariable UUID userId) {
        return ResponseEntity.ok(followService.getFollowing(userId));
    }

    /**
     * GET /api/follows/status/{followerId}/{followingId}
     * Returns FollowStatusResponse.
     */
    @GetMapping("/status/{followerId}/{followingId}")
    public ResponseEntity<FollowStatusResponse> getFollowStatus(
            @PathVariable UUID followerId,
            @PathVariable UUID followingId) {
        return ResponseEntity.ok(followService.getFollowStatus(followerId, followingId));
    }

    /**
     * GET /api/follows/check/{followerId}/{followingId}
     * Returns simple following state.
     */
    @GetMapping("/check/{followerId}/{followingId}")
    public ResponseEntity<Map<String, Boolean>> isFollowing(
            @PathVariable UUID followerId,
            @PathVariable UUID followingId) {
        boolean following = followService.isFollowing(followerId, followingId);
        return ResponseEntity.ok(Map.of("following", following));
    }
}
