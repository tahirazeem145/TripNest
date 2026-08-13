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
 * JPA entity mapping public.likes.
 *
 * The likes table enforces a UNIQUE(post_id, user_id) constraint
 * at the database level. We do not need to replicate this in JPA;
 * it is validated by the DB on insert.
 *
 * DDL (inferred from likeService.js):
 *   id         UUID PK
 *   post_id    UUID (FK → public.posts.id)
 *   user_id    UUID (FK → auth.users.id)
 *   created_at TIMESTAMPTZ (may exist — mapped as nullable Instant)
 *
 * If created_at does not exist in the actual schema, Hibernate validate
 * will fail and we will remove that field. The column presence is
 * verified at startup.
 */
@Entity
@Table(name = "likes", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "post_id", nullable = false, updatable = false)
    private UUID postId;

    /** User who liked — references auth.users(id). */
    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    /** Nullable — only mapped if the column exists in the real schema. */
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
