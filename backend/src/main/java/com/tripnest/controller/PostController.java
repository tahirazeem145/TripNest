package com.tripnest.controller;

import com.tripnest.dto.PostResponse;
import com.tripnest.dto.CreatePostRequest;
import com.tripnest.dto.UpdatePostRequest;
import com.tripnest.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for managing posts and feed retrieval.
 */
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final com.tripnest.security.AuthenticatedUserService authenticatedUserService;

    /**
     * GET /api/posts
     * Retrieves all posts ordered by newest first.
     */
    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    /**
     * GET /api/posts/{postId}
     * Retrieves a single post.
     */
    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable UUID postId) {
        return ResponseEntity.ok(postService.getPostById(postId));
    }

    /**
     * GET /api/posts/user/{userId}
     * Retrieves all posts created by a specific user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostResponse>> getPostsByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(postService.getPostsByUserId(userId));
    }

    /**
     * POST /api/posts
     * Creates a new post. Authenticated user ID overrides any client provided ID.
     */
    @PostMapping
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody CreatePostRequest request) {
        UUID authenticatedUserId = authenticatedUserService.getCurrentUserId();
        PostResponse created = postService.createPost(authenticatedUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/posts/{postId}
     * Updates a post. Ownership is verified using authenticated user ID.
     */
    @PutMapping("/{postId}")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable UUID postId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestParam(value = "userId", required = false) UUID paramUserId,
            @Valid @RequestBody UpdatePostRequest request) {

        UUID authenticatedUserId = authenticatedUserService.getCurrentUserId();
        return ResponseEntity.ok(postService.updatePost(postId, authenticatedUserId, request));
    }

    /**
     * DELETE /api/posts/{postId}
     * Deletes a post. Ownership is verified using authenticated user ID.
     */
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable UUID postId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestParam(value = "userId", required = false) UUID paramUserId) {

        UUID authenticatedUserId = authenticatedUserService.getCurrentUserId();
        postService.deletePost(postId, authenticatedUserId);
        return ResponseEntity.noContent().build();
    }
}
