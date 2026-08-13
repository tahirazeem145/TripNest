package com.tripnest.controller;

import com.tripnest.dto.CreateSavedPostRequest;
import com.tripnest.dto.SavedPostResponse;
import com.tripnest.dto.SavedPostStatusResponse;
import com.tripnest.dto.SavedPostWithPostResponse;
import com.tripnest.service.SavedPostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for managing saved posts.
 */
@RestController
@RequestMapping("/api/saved-posts")
@RequiredArgsConstructor
public class SavedPostController {

    private final SavedPostService savedPostService;

    /**
     * POST /api/saved-posts
     * Creates a saved-post relationship.
     */
    @PostMapping
    public ResponseEntity<SavedPostResponse> savePost(@Valid @RequestBody CreateSavedPostRequest request) {
        SavedPostResponse response = savedPostService.savePost(request.getUserId(), request.getPostId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * DELETE /api/saved-posts
     * Unsaves a post.
     * Expects parameters: ?userId=...&postId=...
     */
    @DeleteMapping
    public ResponseEntity<Void> unsavePost(
            @RequestParam UUID userId,
            @RequestParam UUID postId) {
        savedPostService.unsavePost(userId, postId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/saved-posts/user/{userId}
     * Returns all saved posts for a user, ordered newest saved first.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SavedPostWithPostResponse>> getSavedPosts(@PathVariable UUID userId) {
        return ResponseEntity.ok(savedPostService.getSavedPosts(userId));
    }

    /**
     * GET /api/saved-posts/user/{userId}/post/{postId}
     * Returns one saved post with the associated post and author profile.
     */
    @GetMapping("/user/{userId}/post/{postId}")
    public ResponseEntity<SavedPostWithPostResponse> getSavedPost(
            @PathVariable UUID userId,
            @PathVariable UUID postId) {
        return ResponseEntity.ok(savedPostService.getSavedPost(userId, postId));
    }

    /**
     * GET /api/saved-posts/post/{postId}/user/{userId}
     * Returns saved status (e.g. { postId: "...", userId: "...", saved: true })
     */
    @GetMapping("/post/{postId}/user/{userId}")
    public ResponseEntity<SavedPostStatusResponse> getSavedStatus(
            @PathVariable UUID postId,
            @PathVariable UUID userId) {
        return ResponseEntity.ok(savedPostService.getSavedStatus(userId, postId));
    }

    /**
     * GET /api/saved-posts/check/{postId}/{userId}
     * Returns simple boolean check (e.g. { saved: true })
     */
    @GetMapping("/check/{postId}/{userId}")
    public ResponseEntity<Map<String, Boolean>> isSaved(
            @PathVariable UUID postId,
            @PathVariable UUID userId) {
        boolean saved = savedPostService.isSaved(userId, postId);
        return ResponseEntity.ok(Map.of("saved", saved));
    }
}
