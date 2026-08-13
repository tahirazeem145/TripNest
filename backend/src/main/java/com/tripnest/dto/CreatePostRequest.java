package com.tripnest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for creating a post.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    @NotBlank(message = "Destination is required")
    private String destination;

    private String[] tags;
}
