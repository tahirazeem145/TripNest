package com.tripnest.repository;

import com.tripnest.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link Like}.
 *
 * Phase 2: Basic query methods.
 * Like/unlike API comes in Phase 5.
 */
@Repository
public interface LikeRepository extends JpaRepository<Like, UUID> {

    /** Find the like record for a specific user+post combination. */
    Optional<Like> findByPostIdAndUserId(UUID postId, UUID userId);

    /** Check whether a user has already liked a post. */
    boolean existsByPostIdAndUserId(UUID postId, UUID userId);

    /** Count total likes on a given post. */
    long countByPostId(UUID postId);

    /** Find all likes on a post ordered by creation date ascending. */
    List<Like> findByPostIdOrderByCreatedAtAsc(UUID postId);

    /** All likes by a specific user (for batch operations). */
    List<Like> findByUserIdAndPostIdIn(UUID userId, List<UUID> postIds);
}
