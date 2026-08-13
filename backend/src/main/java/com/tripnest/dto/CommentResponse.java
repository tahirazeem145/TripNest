package com.tripnest.dto;

import com.tripnest.entity.Comment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO representing a comment returned by the REST APIs.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private UUID id;
    private UUID postId;
    private UUID userId;
    private String content;
    private Instant createdAt;
    private ProfileResponse profile;

    /**
     * Converts a Comment entity and its corresponding ProfileResponse to a CommentResponse DTO.
     */
    public static CommentResponse fromEntity(Comment comment, ProfileResponse profileResponse) {
        if (comment == null) {
            return null;
        }
        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPostId())
                .userId(comment.getUserId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .profile(profileResponse)
                .build();
    }
}
