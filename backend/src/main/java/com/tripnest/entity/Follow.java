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
 * JPA entity mapping public.follows.
 *
 * The follows table has these DB-level constraints:
 *   CHECK (follower_id <> following_id)   — prevents self-following
 *   UNIQUE (follower_id, following_id)    — prevents duplicate follows
 *
 * Both are enforced by the database. We do NOT replicate them as JPA
 * annotations (no @UniqueConstraint needed here — they're already in DB).
 *
 * DDL (inferred from followService.js):
 *   id           UUID PK
 *   follower_id  UUID (FK → auth.users.id)
 *   following_id UUID (FK → auth.users.id)
 *   created_at   TIMESTAMPTZ
 *
 * Both UUID columns reference auth.users(id), NOT profiles.
 * They are mapped as plain UUIDs — no @ManyToOne.
 */
@Entity
@Table(name = "follows", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    /** The user who initiates the follow. References auth.users(id). */
    @Column(name = "follower_id", nullable = false, updatable = false)
    private UUID followerId;

    /** The user being followed. References auth.users(id). */
    @Column(name = "following_id", nullable = false, updatable = false)
    private UUID followingId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
