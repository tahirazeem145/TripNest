package com.tripnest.dto;

import com.tripnest.entity.Like;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO representing a like record returned by the REST APIs.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LikeResponse {
    private UUID id;
    private UUID postId;
    private UUID userId;
    private Instant createdAt;

    /**
     * Converts a Like entity to a LikeResponse DTO.
     */
    public static LikeResponse fromEntity(Like like) {
        if (like == null) {
            return null;
        }
        return LikeResponse.builder()
                .id(like.getId())
                .postId(like.getPostId())
                .userId(like.getUserId())
                .createdAt(like.getCreatedAt())
                .build();
    }
}
