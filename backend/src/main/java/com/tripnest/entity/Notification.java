package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

/**
 * JPA entity mapping public.notifications.
 *
 * Notifications are created entirely by PostgreSQL triggers defined in
 * Supabase. Spring Boot must NEVER insert notifications directly —
 * they are the responsibility of the existing DB triggers.
 *
 * DDL (inferred from notificationService.js):
 *   id           UUID PK
 *   recipient_id UUID (FK → auth.users.id) — who receives the notification
 *   actor_id     UUID (FK → auth.users.id) — who triggered it (liked, commented, etc.)
 *   type         TEXT — e.g. 'like', 'comment', 'follow'
 *   post_id      UUID (nullable) — related post, if applicable
 *   comment_id   UUID (nullable) — related comment, if applicable
 *   message      TEXT (nullable) — optional human-readable message
 *   is_read      BOOLEAN NOT NULL DEFAULT false
 *   created_at   TIMESTAMPTZ
 *
 * All UUID FK columns map to auth.users(id) — plain UUIDs, no @ManyToOne.
 */
@Entity
@Table(name = "notifications", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    /** Recipient user — references auth.users(id). */
    @Column(name = "recipient_id", nullable = false, updatable = false)
    private UUID recipientId;

    /** Actor user who triggered this notification — references auth.users(id). */
    @Column(name = "actor_id", updatable = false)
    private UUID actorId;

    /**
     * Notification type — e.g. 'like', 'comment', 'follow'.
     * The actual values are defined by Supabase triggers.
     */
    @Column(name = "type", nullable = false, updatable = false)
    private String type;

    /** Related post, if applicable. Nullable. */
    @Column(name = "post_id", updatable = false)
    private UUID postId;

    /** Related comment, if applicable. Nullable. */
    @Column(name = "comment_id", updatable = false)
    private UUID commentId;

    /** Optional human-readable message. Nullable. */
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read", nullable = false)
    private boolean isRead;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
