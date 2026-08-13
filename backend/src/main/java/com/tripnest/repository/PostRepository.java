package com.tripnest.repository;

import com.tripnest.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link Post}.
 *
 * Phase 2: Basic query methods.
 * Full post feed and CRUD APIs come in Phase 4.
 */
@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    /** All posts ordered newest first (used for the home feed). */
    List<Post> findAllByOrderByCreatedAtDesc();

    /** Posts by a specific user, newest first (used for profile pages). */
    List<Post> findByUserIdOrderByCreatedAtDesc(UUID userId);

    /** Count posts by a specific user (used for profile stats). */
    long countByUserId(UUID userId);

    /** Batch retrieve posts by a list of IDs. */
    List<Post> findAllByIdIn(List<UUID> postIds);
}
