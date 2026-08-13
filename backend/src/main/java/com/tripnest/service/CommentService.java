package com.tripnest.service;

import com.tripnest.dto.CommentResponse;
import com.tripnest.dto.CreateCommentRequest;
import com.tripnest.dto.ProfileResponse;
import com.tripnest.entity.Comment;
import com.tripnest.entity.Profile;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.repository.CommentRepository;
import com.tripnest.repository.PostRepository;
import com.tripnest.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service managing comments on posts.
 */
@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final ProfileRepository profileRepository;

    /**
     * Retrieves all comments for a post, sorted oldest first.
     * Profiles are batch-fetched to avoid N+1 query overhead.
     */
    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByPostId(UUID postId) {
        // Verify post exists
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post", "id", postId);
        }

        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
        if (comments.isEmpty()) {
            return List.of();
        }

        // Collect unique commenter user IDs
        List<UUID> userIds = comments.stream()
                .map(Comment::getUserId)
                .distinct()
                .collect(Collectors.toList());

        List<Profile> profiles = profileRepository.findAllByIdIn(userIds);

        Map<UUID, ProfileResponse> profileMap = profiles.stream()
                .collect(Collectors.toMap(
                        Profile::getId,
                        ProfileResponse::fromEntity,
                        (existing, replacement) -> existing
                ));

        return comments.stream()
                .map(comment -> CommentResponse.fromEntity(comment, profileMap.get(comment.getUserId())))
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single comment by ID.
     */
    @Transactional(readOnly = true)
    public CommentResponse getCommentById(UUID commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        Profile profile = profileRepository.findById(comment.getUserId()).orElse(null);
        return CommentResponse.fromEntity(comment, ProfileResponse.fromEntity(profile));
    }

    /**
     * Creates a new comment on a post.
     */
    @Transactional
    public CommentResponse createComment(UUID userId, CreateCommentRequest request) {
        // Verify referenced post exists
        if (!postRepository.existsById(request.getPostId())) {
            throw new ResourceNotFoundException("Post", "id", request.getPostId());
        }

        Comment comment = Comment.builder()
                .postId(request.getPostId())
                .userId(userId)
                .content(request.getContent().trim())
                .createdAt(Instant.now())
                .build();

        Comment saved = commentRepository.save(comment);
        Profile profile = profileRepository.findById(userId).orElse(null);
        return CommentResponse.fromEntity(saved, ProfileResponse.fromEntity(profile));
    }

    /**
     * Deletes a comment. Verifies ownership.
     */
    @Transactional
    public void deleteComment(UUID commentId, UUID userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        // Ownership validation
        if (!comment.getUserId().equals(userId)) {
            throw new AccessDeniedException("User is not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }
}
