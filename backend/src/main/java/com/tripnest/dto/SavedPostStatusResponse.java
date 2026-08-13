package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO representing the saved status of a post for a user.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedPostStatusResponse {
    private UUID postId;
    private UUID userId;
    private boolean saved;
}
