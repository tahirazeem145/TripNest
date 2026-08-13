package com.tripnest.controller;

import com.tripnest.dto.NotificationResponse;
import com.tripnest.dto.UnreadNotificationCountResponse;
import com.tripnest.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for managing notifications.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final com.tripnest.security.AuthenticatedUserService authenticatedUserService;

    /**
     * GET /api/notifications/user/{userId}
     * Retrieves all notifications for a user, newest first.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getNotifications(@PathVariable UUID userId) {
        // Enforce ownership: only authenticated user can view their notifications
        UUID authenticatedUserId = authenticatedUserService.getCurrentUserId();
        if (!authenticatedUserId.equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Cannot view another user's notifications");
        }
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId));
    }

    /**
     * GET /api/notifications/user/{userId}/unread-count
     * Returns the unread notification count.
     */
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<UnreadNotificationCountResponse> getUnreadCount(@PathVariable UUID userId) {
        // Enforce ownership
        UUID authenticatedUserId = authenticatedUserService.getCurrentUserId();
        if (!authenticatedUserId.equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Cannot view another user's notifications");
        }
        return ResponseEntity.ok(notificationService.getUnreadNotificationCount(userId));
    }

    /**
     * PUT /api/notifications/{notificationId}/read
     * Marks one notification as read.
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID notificationId,
            @RequestParam(required = false) UUID userId) {
        UUID authenticatedUserId = authenticatedUserService.getCurrentUserId();
        notificationService.markAsRead(notificationId, authenticatedUserId);
        return ResponseEntity.ok().build();
    }

    /**
     * PUT /api/notifications/user/{userId}/read-all
     * Marks all notifications as read for a given user.
     */
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable UUID userId) {
        UUID authenticatedUserId = authenticatedUserService.getCurrentUserId();
        if (!authenticatedUserId.equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Cannot mark another user's notifications as read");
        }
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * DELETE /api/notifications/{notificationId}
     * Deletes a single notification.
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable UUID notificationId,
            @RequestParam(required = false) UUID userId) {
        UUID authenticatedUserId = authenticatedUserService.getCurrentUserId();
        notificationService.deleteNotification(notificationId, authenticatedUserId);
        return ResponseEntity.noContent().build();
    }
}
