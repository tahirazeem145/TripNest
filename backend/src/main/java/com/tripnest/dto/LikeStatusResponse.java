package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO representing the like status of a post for a specific user.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LikeStatusResponse {
    private UUID postId;
    private UUID userId;
    private boolean liked;
    private long likeCount;
}
