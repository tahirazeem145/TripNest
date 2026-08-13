package com.tripnest.service;

import com.tripnest.dto.PostResponse;
import com.tripnest.dto.CreatePostRequest;
import com.tripnest.dto.UpdatePostRequest;
import com.tripnest.dto.ProfileResponse;
import com.tripnest.entity.Post;
import com.tripnest.entity.Profile;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.repository.PostRepository;
import com.tripnest.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service managing business logic for travel posts.
 */
@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final ProfileRepository profileRepository;

    /**
     * Retrieves all posts ordered by creation date descending.
     * Profiles are fetched in a single batch to prevent N+1 query issue.
     */
    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts() {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        if (posts.isEmpty()) {
            return List.of();
        }

        // Extract unique user IDs and fetch all profiles in one batch
        List<UUID> userIds = posts.stream()
                .map(Post::getUserId)
                .distinct()
                .collect(Collectors.toList());

        List<Profile> profiles = profileRepository.findAllByIdIn(userIds);

        Map<UUID, ProfileResponse> profileMap = profiles.stream()
                .collect(Collectors.toMap(
                        Profile::getId,
                        ProfileResponse::fromEntity,
                        (existing, replacement) -> existing
                ));

        return posts.stream()
                .map(post -> PostResponse.fromEntity(post, profileMap.get(post.getUserId())))
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single post by its ID.
     */
    @Transactional(readOnly = true)
    public PostResponse getPostById(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        Profile profile = profileRepository.findById(post.getUserId()).orElse(null);
        return PostResponse.fromEntity(post, ProfileResponse.fromEntity(profile));
    }

    /**
     * Retrieves all posts created by a specific user.
     */
    @Transactional(readOnly = true)
    public List<PostResponse> getPostsByUserId(UUID userId) {
        List<Post> posts = postRepository.findByUserIdOrderByCreatedAtDesc(userId);
        Profile profile = profileRepository.findById(userId).orElse(null);
        ProfileResponse profileResponse = ProfileResponse.fromEntity(profile);

        return posts.stream()
                .map(post -> PostResponse.fromEntity(post, profileResponse))
                .collect(Collectors.toList());
    }

    /**
     * Creates a new post.
     */
    @Transactional
    public PostResponse createPost(UUID userId, CreatePostRequest request) {
        Instant now = Instant.now();
        Post post = Post.builder()
                .userId(userId)
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .destination(request.getDestination())
                .tags(request.getTags())
                .createdAt(now)
                .updatedAt(now)
                .build();

        Post saved = postRepository.save(post);
        Profile profile = profileRepository.findById(userId).orElse(null);
        return PostResponse.fromEntity(saved, ProfileResponse.fromEntity(profile));
    }

    /**
     * Updates an existing post. Verifies ownership.
     */
    @Transactional
    public PostResponse updatePost(UUID postId, UUID userId, UpdatePostRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        // Ownership validation
        if (!post.getUserId().equals(userId)) {
            throw new AccessDeniedException("User is not authorized to update this post");
        }

        if (request.getTitle() != null) {
            post.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            post.setDescription(request.getDescription());
        }
        if (request.getImageUrl() != null) {
            post.setImageUrl(request.getImageUrl());
        }
        if (request.getDestination() != null) {
            post.setDestination(request.getDestination());
        }
        if (request.getTags() != null) {
            post.setTags(request.getTags());
        }
        post.setUpdatedAt(Instant.now());

        Post saved = postRepository.save(post);
        Profile profile = profileRepository.findById(userId).orElse(null);
        return PostResponse.fromEntity(saved, ProfileResponse.fromEntity(profile));
    }

    /**
     * Deletes a post. Verifies ownership.
     */
    @Transactional
    public void deletePost(UUID postId, UUID userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        // Ownership validation
        if (!post.getUserId().equals(userId)) {
            throw new AccessDeniedException("User is not authorized to delete this post");
        }

        postRepository.delete(post);
    }
}
