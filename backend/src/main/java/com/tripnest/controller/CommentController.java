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
     * Creates a comment. Accept user ID through request body.
     */
    @PostMapping
    public ResponseEntity<CommentResponse> createComment(@Valid @RequestBody CreateCommentRequest request) {
        CommentResponse created = commentService.createComment(request.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * DELETE /api/comments/{commentId}
     * Deletes a comment. Ownership is verified using user ID from header or query parameter.
     */
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID commentId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestParam(value = "userId", required = false) UUID paramUserId) {

        UUID userId = (headerUserId != null) ? headerUserId : paramUserId;
        if (userId == null) {
            throw new IllegalArgumentException("User ID must be supplied via 'X-User-Id' header or 'userId' parameter");
        }

        commentService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}
