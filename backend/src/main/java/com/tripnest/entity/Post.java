package com.tripnest.entity;

import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.util.UUID;

/**
 * JPA entity mapping public.posts.
 *
 * Key design decisions:
 *
 * 1. user_id is a UUID referencing auth.users(id). We do NOT model
 *    this as a @ManyToOne to avoid requiring an auth.users entity.
 *    Profile information is fetched separately via ProfileRepository.
 *
 * 2. tags is a PostgreSQL TEXT[] column. We use Hypersistence Utils
 *    StringArrayType to map it to String[] without modifying the schema.
 *    @Column(columnDefinition = "text[]") tells Hibernate the raw type
 *    so that ddl-auto=validate accepts the existing column.
 *
 * 3. updated_at may be null if no update has occurred. It is mapped
 *    as nullable Instant.
 *
 * Expected DDL:
 *   id           UUID PK
 *   user_id      UUID (auth.users FK)
 *   title        TEXT
 *   description  TEXT
 *   image_url    TEXT
 *   destination  TEXT
 *   tags         TEXT[]
 *   created_at   TIMESTAMPTZ
 *   updated_at   TIMESTAMPTZ (nullable)
 */
@Entity
@Table(name = "posts", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    /**
     * Author — references auth.users(id). Not modelled as @ManyToOne.
     * Use ProfileRepository.findById(userId) to get profile data.
     */
    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "title", nullable = false, columnDefinition = "TEXT")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "destination", columnDefinition = "TEXT")
    private String destination;

    /**
     * PostgreSQL TEXT[] mapped via Hypersistence Utils StringArrayType.
     * The @Column columnDefinition must match the DB column type exactly
     * so Hibernate validate mode does not complain.
     */
    @Type(StringArrayType.class)
    @Column(name = "tags", columnDefinition = "_text")
    private String[] tags;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** May be null if the post has never been updated. */
    @Column(name = "updated_at")
    private Instant updatedAt;
}
