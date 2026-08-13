package com.tripnest.dto;

import com.tripnest.entity.Follow;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO representing a follow relationship.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowResponse {
    private UUID id;
    private UUID followerId;
    private UUID followingId;
    private Instant createdAt;

    /**
     * Converts a Follow entity to a FollowResponse DTO.
     */
    public static FollowResponse fromEntity(Follow follow) {
        if (follow == null) {
            return null;
        }
        return FollowResponse.builder()
                .id(follow.getId())
                .followerId(follow.getFollowerId())
                .followingId(follow.getFollowingId())
                .createdAt(follow.getCreatedAt())
                .build();
    }
}
