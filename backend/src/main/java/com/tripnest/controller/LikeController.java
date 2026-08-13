package com.tripnest.controller;

import com.tripnest.dto.LikeResponse;
import com.tripnest.dto.LikeStatusResponse;
import com.tripnest.dto.CreateLikeRequest;
import com.tripnest.service.LikeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for managing post likes.
 */
@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;
    private final com.tripnest.security.AuthenticatedUserService authenticatedUserService;

    /**
     * POST /api/likes
     * Likes a post. Authenticated user overrides any client-provided ID.
     */
    @PostMapping
    public ResponseEntity<LikeResponse> likePost(@Valid @RequestBody CreateLikeRequest request) {
        UUID authenticatedUserId = authenticatedUserService.getCurrentUserId();
        LikeResponse response = likeService.likePost(request.getPostId(), authenticatedUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * DELETE /api/likes/{postId}
     * Unlikes a post. Ownership is verified using authenticated user ID.
     */
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> unlikePost(
            @PathVariable UUID postId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestParam(value = "userId", required = false) UUID paramUserId) {

        UUID authenticatedUserId = authenticatedUserService.getCurrentUserId();
        likeService.unlikePost(postId, authenticatedUserId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/likes/post/{postId}
     * Returns list of all likes on a post.
     */
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<LikeResponse>> getLikesByPostId(@PathVariable UUID postId) {
        return ResponseEntity.ok(likeService.getLikesByPostId(postId));
    }

    /**
     * GET /api/likes/post/{postId}/count
     * Returns total number of likes on a post.
     */
    @GetMapping("/post/{postId}/count")
    public ResponseEntity<Long> getLikeCount(@PathVariable UUID postId) {
        return ResponseEntity.ok(likeService.getLikeCount(postId));
    }

    /**
     * GET /api/likes/post/{postId}/user/{userId}
     * Returns whether the specified user liked the post.
     */
    @GetMapping("/post/{postId}/user/{userId}")
    public ResponseEntity<Boolean> isLikedByUser(@PathVariable UUID postId, @PathVariable UUID userId) {
        return ResponseEntity.ok(likeService.isLikedByUser(postId, userId));
    }

    /**
     * GET /api/likes/post/{postId}/status/{userId}
     * Returns full like status payload.
     */
    @GetMapping("/post/{postId}/status/{userId}")
    public ResponseEntity<LikeStatusResponse> getLikeStatus(
            @PathVariable UUID postId,
            @PathVariable UUID userId) {
        return ResponseEntity.ok(likeService.getLikeStatus(postId, userId));
    }
}
