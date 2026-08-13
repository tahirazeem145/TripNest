package com.tripnest.dto;

import com.tripnest.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO representing a notification.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private UUID id;
    private UUID recipientId;
    private UUID actorId;
    private String type;
    private UUID postId;
    private UUID commentId;
    private String message;
    private boolean isRead;
    private Instant createdAt;
    private ProfileResponse actorProfile;

    /**
     * Maps a Notification entity and a ProfileResponse to a NotificationResponse.
     */
    public static NotificationResponse fromEntity(Notification notification, ProfileResponse actorProfile) {
        if (notification == null) {
            return null;
        }
        return NotificationResponse.builder()
                .id(notification.getId())
                .recipientId(notification.getRecipientId())
                .actorId(notification.getActorId())
                .type(notification.getType())
                .postId(notification.getPostId())
                .commentId(notification.getCommentId())
                .message(notification.getMessage())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .actorProfile(actorProfile)
                .build();
    }
}
