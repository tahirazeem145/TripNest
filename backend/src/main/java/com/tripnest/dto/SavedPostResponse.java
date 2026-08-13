package com.tripnest.dto;

import com.tripnest.entity.SavedPost;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO representing a saved post record.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedPostResponse {
    private UUID id;
    private UUID userId;
    private UUID postId;
    private Instant createdAt;

    /**
     * Converts a SavedPost entity to a SavedPostResponse DTO.
     */
    public static SavedPostResponse fromEntity(SavedPost savedPost) {
        if (savedPost == null) {
            return null;
        }
        return SavedPostResponse.builder()
                .id(savedPost.getId())
                .userId(savedPost.getUserId())
                .postId(savedPost.getPostId())
                .createdAt(savedPost.getCreatedAt())
                .build();
    }
}
