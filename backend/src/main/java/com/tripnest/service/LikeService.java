package com.tripnest.service;

import com.tripnest.dto.LikeResponse;
import com.tripnest.dto.LikeStatusResponse;
import com.tripnest.entity.Like;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.repository.LikeRepository;
import com.tripnest.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service managing post likes.
 */
@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;

    /**
     * Likes a post. If already liked, returns the existing like gracefully.
     */
    @Transactional
    public LikeResponse likePost(UUID postId, UUID userId) {
        // Verify post exists
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post", "id", postId);
        }

        // Duplicate checks
        Optional<Like> existing = likeRepository.findByPostIdAndUserId(postId, userId);
        if (existing.isPresent()) {
            return LikeResponse.fromEntity(existing.get());
        }

        Like like = Like.builder()
                .postId(postId)
                .userId(userId)
                .createdAt(Instant.now())
                .build();

        Like saved = likeRepository.save(like);
        return LikeResponse.fromEntity(saved);
    }

    /**
     * Unlikes a post.
     */
    @Transactional
    public void unlikePost(UUID postId, UUID userId) {
        Like like = likeRepository.findByPostIdAndUserId(postId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Like record not found"));

        likeRepository.delete(like);
    }

    /**
     * Gets all likes on a post, ordered oldest first.
     */
    @Transactional(readOnly = true)
    public List<LikeResponse> getLikesByPostId(UUID postId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post", "id", postId);
        }

        return likeRepository.findByPostIdOrderByCreatedAtAsc(postId).stream()
                .map(LikeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Gets the like count for a post.
     */
    @Transactional(readOnly = true)
    public long getLikeCount(UUID postId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post", "id", postId);
        }

        return likeRepository.countByPostId(postId);
    }

    /**
     * Checks if a post is liked by a specific user.
     */
    @Transactional(readOnly = true)
    public boolean isLikedByUser(UUID postId, UUID userId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post", "id", postId);
        }

        return likeRepository.existsByPostIdAndUserId(postId, userId);
    }

    /**
     * Returns the full like status for a post and user.
     */
    @Transactional(readOnly = true)
    public LikeStatusResponse getLikeStatus(UUID postId, UUID userId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post", "id", postId);
        }

        boolean liked = likeRepository.existsByPostIdAndUserId(postId, userId);
        long count = likeRepository.countByPostId(postId);

        return LikeStatusResponse.builder()
                .postId(postId)
                .userId(userId)
                .liked(liked)
                .likeCount(count)
                .build();
    }
}
