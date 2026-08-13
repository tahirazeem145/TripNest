package com.tripnest.controller;

import com.tripnest.dto.CommentResponse;
import com.tripnest.dto.CreateCommentRequest;
import com.tripnest.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for managing post comments.
 */
@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final com.tripnest.security.AuthenticatedUserService authenticatedUserService;

    /**
     * GET /api/comments/post/{postId}
     * Returns all comments for a specific post, ordered oldest first.
     */
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentResponse>> getCommentsByPostId(@PathVariable UUID postId) {
        return ResponseEntity.ok(commentService.getCommentsByPostId(postId));
    }

    /**
     * GET /api/comments/{commentId}
     * Returns a single comment with the commenter profile.
     */
    @GetMapping("/{commentId}")
    public ResponseEntity<CommentResponse> getCommentById(@PathVariable UUID commentId) {
        return ResponseEntity.ok(commentService.getCommentById(commentId));
    }

    /**
     * POST /api/comments
     * Creates a comment. Authenticated user ID overrides any client provided ID.
     */
    @PostMapping
    public ResponseEntity<CommentResponse> createComment(@Valid @RequestBody CreateCommentRequest request) {
        UUID authenticatedUserId = authenticatedUserService.getCurrentUserId();
        CommentResponse created = commentService.createComment(authenticatedUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * DELETE /api/comments/{commentId}
     * Deletes a comment. Ownership is verified using authenticated user ID.
     */
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID commentId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestParam(value = "userId", required = false) UUID paramUserId) {

        UUID authenticatedUserId = authenticatedUserService.getCurrentUserId();
        commentService.deleteComment(commentId, authenticatedUserId);
        return ResponseEntity.noContent().build();
    }
}
