package com.tripnest.repository;

import com.tripnest.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link Follow}.
 *
 * Phase 2: Basic query methods.
 * Follow/unfollow API comes in Phase 5.
 */
@Repository
public interface FollowRepository extends JpaRepository<Follow, UUID> {

    /** All follows where this user is the follower (i.e. who they follow). */
    List<Follow> findByFollowerId(UUID followerId);

    /** All follows where this user is being followed (i.e. their followers). */
    List<Follow> findByFollowingId(UUID followingId);

    /** Check if followerUserId is following followingUserId. */
    boolean existsByFollowerIdAndFollowingId(UUID followerId, UUID followingId);

    /** Count how many users a user is following. */
    long countByFollowerId(UUID followerId);

    /** Count how many followers a user has. */
    long countByFollowingId(UUID followingId);
}
