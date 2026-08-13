package com.tripnest.service;

import com.tripnest.dto.FollowResponse;
import com.tripnest.dto.FollowStatusResponse;
import com.tripnest.dto.FollowWithProfileResponse;
import com.tripnest.dto.ProfileResponse;
import com.tripnest.entity.Follow;
import com.tripnest.entity.Profile;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.repository.FollowRepository;
import com.tripnest.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service managing follow relationships.
 */
@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final ProfileRepository profileRepository;

    /**
     * Follows a user. Returns gracefully if already following.
     */
    @Transactional
    public FollowResponse followUser(UUID followerId, UUID followingId) {
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("Users cannot follow themselves.");
        }

        if (!profileRepository.existsById(followerId)) {
            throw new ResourceNotFoundException("Profile", "id", followerId);
        }
        if (!profileRepository.existsById(followingId)) {
            throw new ResourceNotFoundException("Profile", "id", followingId);
        }

        // Check for duplicates
        Optional<Follow> existing = followRepository.findByFollowerIdAndFollowingId(followerId, followingId);
        if (existing.isPresent()) {
            return FollowResponse.fromEntity(existing.get());
        }

        Follow follow = Follow.builder()
                .followerId(followerId)
                .followingId(followingId)
                .createdAt(Instant.now())
                .build();

        Follow saved = followRepository.save(follow);
        return FollowResponse.fromEntity(saved);
    }

    /**
     * Unfollows a user.
     */
    @Transactional
    public void unfollowUser(UUID followerId, UUID followingId) {
        Follow follow = followRepository.findByFollowerIdAndFollowingId(followerId, followingId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow relationship not found"));

        followRepository.delete(follow);
    }

    /**
     * Gets a list of users that follow the specified user (Followers).
     */
    @Transactional(readOnly = true)
    public List<FollowWithProfileResponse> getFollowers(UUID userId) {
        if (!profileRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Profile", "id", userId);
        }

        List<Follow> follows = followRepository.findByFollowingIdOrderByCreatedAtDesc(userId);
        
        List<UUID> followerIds = follows.stream()
                .map(Follow::getFollowerId)
                .collect(Collectors.toList());

        Map<UUID, Profile> profilesMap = profileRepository.findAllByIdIn(followerIds).stream()
                .collect(Collectors.toMap(Profile::getId, p -> p));

        return follows.stream().map(f -> {
            Profile profile = profilesMap.get(f.getFollowerId());
            return FollowWithProfileResponse.builder()
                    .follow(FollowResponse.fromEntity(f))
                    .profile(profile != null ? ProfileResponse.fromEntity(profile) : null)
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Gets a list of users that the specified user follows (Following).
     */
    @Transactional(readOnly = true)
    public List<FollowWithProfileResponse> getFollowing(UUID userId) {
        if (!profileRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Profile", "id", userId);
        }

        List<Follow> follows = followRepository.findByFollowerIdOrderByCreatedAtDesc(userId);

        List<UUID> followingIds = follows.stream()
                .map(Follow::getFollowingId)
                .collect(Collectors.toList());

        Map<UUID, Profile> profilesMap = profileRepository.findAllByIdIn(followingIds).stream()
                .collect(Collectors.toMap(Profile::getId, p -> p));

        return follows.stream().map(f -> {
            Profile profile = profilesMap.get(f.getFollowingId());
            return FollowWithProfileResponse.builder()
                    .follow(FollowResponse.fromEntity(f))
                    .profile(profile != null ? ProfileResponse.fromEntity(profile) : null)
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Checks if followerId is following followingId.
     */
    @Transactional(readOnly = true)
    public boolean isFollowing(UUID followerId, UUID followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }

    /**
     * Returns full follow status details.
     */
    @Transactional(readOnly = true)
    public FollowStatusResponse getFollowStatus(UUID followerId, UUID followingId) {
        boolean following = followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
        long followerCount = followRepository.countByFollowingId(followingId);
        long followingCount = followRepository.countByFollowerId(followerId);

        return FollowStatusResponse.builder()
                .followerId(followerId)
                .followingId(followingId)
                .following(following)
                .followerCount(followerCount)
                .followingCount(followingCount)
                .build();
    }
}
