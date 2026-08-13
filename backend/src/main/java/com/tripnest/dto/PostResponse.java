package com.tripnest.dto;

import com.tripnest.entity.Post;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO representing a post returned by the REST APIs.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    private UUID id;
    private UUID userId;
    private String title;
    private String description;
    private String imageUrl;
    private String destination;
    private String[] tags;
    private Instant createdAt;
    private Instant updatedAt;
    private ProfileResponse profile;

    /**
     * Converts a Post entity and its corresponding ProfileResponse to a PostResponse DTO.
     */
    public static PostResponse fromEntity(Post post, ProfileResponse profileResponse) {
        if (post == null) {
            return null;
        }
        return PostResponse.builder()
                .id(post.getId())
                .userId(post.getUserId())
                .title(post.getTitle())
                .description(post.getDescription())
                .imageUrl(post.getImageUrl())
                .destination(post.getDestination())
                .tags(post.getTags())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .profile(profileResponse)
                .build();
    }
}
