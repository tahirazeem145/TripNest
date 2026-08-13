package com.tripnest.repository;

import com.tripnest.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link Comment}.
 *
 * Phase 2: Basic query methods.
 * Comment CRUD API comes in Phase 5.
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    /** All comments on a given post, ordered oldest first (chronological). */
    List<Comment> findByPostIdOrderByCreatedAtAsc(UUID postId);

    /** Count comments on a given post (for post card display). */
    long countByPostId(UUID postId);

    /** All comments by a specific user (used for moderation). */
    List<Comment> findByUserId(UUID userId);
}
