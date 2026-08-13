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
 * JPA entity mapping public.comments.
 *
 * DDL (inferred from commentService.js + problem statement):
 *   id         UUID PK
 *   post_id    UUID (FK → public.posts.id)
 *   user_id    UUID (FK → auth.users.id)
 *   content    TEXT
 *   created_at TIMESTAMPTZ
 *
 * user_id is mapped as a plain UUID — no @ManyToOne to auth.users.
 * post_id is mapped as a plain UUID — no @ManyToOne to Post entity
 * (avoids N+1 load issues; join is done at service layer if needed).
 */
@Entity
@Table(name = "comments", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "post_id", nullable = false, updatable = false)
    private UUID postId;

    /** Commenter — references auth.users(id). */
    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
