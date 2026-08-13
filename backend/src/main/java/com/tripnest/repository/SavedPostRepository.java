package com.tripnest.repository;

import com.tripnest.entity.SavedPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link SavedPost}.
 *
 * Phase 2: Basic query methods.
 * Save/unsave API comes in Phase 5.
 */
@Repository
public interface SavedPostRepository extends JpaRepository<SavedPost, UUID> {

    /** All saved posts for a user, newest saved first. */
    List<SavedPost> findByUserIdOrderByCreatedAtDesc(UUID userId);

    /** Check whether a specific post is saved by a user. */
    boolean existsByUserIdAndPostId(UUID userId, UUID postId);

    /** Find the saved-post record for a specific user+post (for unsaving). */
    Optional<SavedPost> findByUserIdAndPostId(UUID userId, UUID postId);

    /** All saved-post records for a given set of post IDs (batch status check). */
    List<SavedPost> findByUserIdAndPostIdIn(UUID userId, List<UUID> postIds);

    /** Count the number of saved posts for a given user. */
    long countByUserId(UUID userId);
}
