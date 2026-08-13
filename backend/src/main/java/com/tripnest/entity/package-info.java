/**
 * JPA Entity classes — Phase 2.
 *
 * Each class maps to an existing Supabase PostgreSQL table:
 *   - Profile      → public.profiles
 *   - Post         → public.posts
 *   - Comment      → public.comments
 *   - Like         → public.likes
 *   - Follow       → public.follows
 *   - SavedPost    → public.saved_posts
 *   - Notification → public.notifications
 *
 * Design principles:
 *   - ddl-auto=validate: Hibernate validates but NEVER modifies the schema.
 *   - auth.users FKs: All user_id / follower_id / following_id /
 *     recipient_id / actor_id columns are mapped as plain UUIDs.
 *     No @ManyToOne relationships to auth.users (not a JPA entity).
 *   - TEXT[]: Post.tags uses Hypersistence Utils StringArrayType.
 */
package com.tripnest.entity;
