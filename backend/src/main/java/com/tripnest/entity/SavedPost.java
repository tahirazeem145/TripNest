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
 * JPA entity mapping public.saved_posts.
 *
 * The saved_posts table enforces:
 *   UNIQUE (user_id, post_id)  — a user can save a post only once
 *
 * This constraint is enforced at DB level.
 *
 * DDL (inferred from savedPostService.js):
 *   id         UUID PK
 *   user_id    UUID (FK → auth.users.id)
 *   post_id    UUID (FK → public.posts.id)
 *   created_at TIMESTAMPTZ
 *
 * user_id references auth.users(id) — mapped as plain UUID.
 */
@Entity
@Table(name = "saved_posts", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedPost {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    /** User who saved the post. References auth.users(id). */
    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "post_id", nullable = false, updatable = false)
    private UUID postId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
