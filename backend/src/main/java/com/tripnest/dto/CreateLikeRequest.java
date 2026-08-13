package com.tripnest.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for liking a post.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateLikeRequest {

    @NotNull(message = "Post ID is required")
    private UUID postId;

    @NotNull(message = "User ID is required")
    private UUID userId;
}
