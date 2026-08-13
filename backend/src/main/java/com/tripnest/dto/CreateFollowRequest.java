package com.tripnest.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for creating a follow relationship.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateFollowRequest {

    @NotNull(message = "Follower ID is required")
    private UUID followerId;

    @NotNull(message = "Following ID is required")
    private UUID followingId;
}
