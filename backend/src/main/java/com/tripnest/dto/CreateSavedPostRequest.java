package com.tripnest.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for saving a post.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSavedPostRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Post ID is required")
    private UUID postId;
}
