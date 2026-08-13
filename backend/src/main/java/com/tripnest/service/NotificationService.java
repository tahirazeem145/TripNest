package com.tripnest.service;

import com.tripnest.dto.NotificationResponse;
import com.tripnest.dto.ProfileResponse;
import com.tripnest.dto.UnreadNotificationCountResponse;
import com.tripnest.entity.Notification;
import com.tripnest.entity.Profile;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.repository.NotificationRepository;
import com.tripnest.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service managing logic for notifications.
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ProfileRepository profileRepository;

    /**
     * Retrieves all notifications for a user, avoiding N+1 queries.
     * Keeps original created_at DESC order.
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsByUserId(UUID userId) {
        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);

        if (notifications.isEmpty()) {
            return List.of();
        }

        // Extract actor IDs
        List<UUID> actorIds = notifications.stream()
                .map(Notification::getActorId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        // Batch fetch profiles
        List<Profile> profiles = profileRepository.findAllByIdIn(actorIds);

        Map<UUID, ProfileResponse> profileMap = profiles.stream()
                .collect(Collectors.toMap(
                        Profile::getId,
                        ProfileResponse::fromEntity,
                        (existing, replacement) -> existing
                ));

        // Map notifications retaining the original order
        return notifications.stream()
                .map(n -> NotificationResponse.fromEntity(n, n.getActorId() != null ? profileMap.get(n.getActorId()) : null))
                .collect(Collectors.toList());
    }

    /**
     * Retrieves unread notification count.
     */
    @Transactional(readOnly = true)
    public UnreadNotificationCountResponse getUnreadNotificationCount(UUID userId) {
        long count = notificationRepository.countByRecipientIdAndIsReadFalse(userId);
        return new UnreadNotificationCountResponse(count);
    }

    /**
     * Marks one specific notification as read. Verifies ownership.
     */
    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findByIdAndRecipientId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.isRead()) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    /**
     * Marks all unread notifications for a user as read using a bulk update.
     */
    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsRead(userId);
    }

    /**
     * Deletes a notification, ensuring ownership.
     */
    @Transactional
    public void deleteNotification(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findByIdAndRecipientId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        notificationRepository.delete(notification);
    }
}
