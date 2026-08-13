package com.tripnest.repository;

import com.tripnest.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link Notification}.
 *
 * Phase 2: Basic query methods.
 * Notification API (read/mark-as-read) comes in Phase 6.
 *
 * IMPORTANT: Notifications are CREATED by Supabase PostgreSQL triggers.
 * Spring Boot should NEVER call save() to create notification rows.
 * This repository is used only for reading and marking-as-read operations.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    /** All notifications for a recipient, newest first. */
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(UUID recipientId);

    /** Count unread notifications for a user (for badge display). */
    long countByRecipientIdAndIsReadFalse(UUID recipientId);

    /** All unread notifications for a user (for bulk mark-as-read). */
    List<Notification> findByRecipientIdAndIsReadFalse(UUID recipientId);
}
