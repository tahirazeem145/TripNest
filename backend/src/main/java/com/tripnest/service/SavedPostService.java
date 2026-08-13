package com.tripnest.service;

import com.tripnest.dto.PostResponse;
import com.tripnest.dto.ProfileResponse;
import com.tripnest.dto.SavedPostResponse;
import com.tripnest.dto.SavedPostStatusResponse;
import com.tripnest.dto.SavedPostWithPostResponse;
import com.tripnest.entity.Post;
import com.tripnest.entity.Profile;
import com.tripnest.entity.SavedPost;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.repository.PostRepository;
import com.tripnest.repository.ProfileRepository;
import com.tripnest.repository.SavedPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service managing saved post relationships.
 */
@Service
@RequiredArgsConstructor
public class SavedPostService {

    private final SavedPostRepository savedPostRepository;
    private final PostRepository postRepository;
    private final ProfileRepository profileRepository;

    /**
     * Saves a post for a user. Handles duplicates gracefully.
     */
    @Transactional
    public SavedPostResponse savePost(UUID userId, UUID postId) {
        // Verify post exists
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post", "id", postId);
        }

        // Handle duplicates
        Optional<SavedPost> existing = savedPostRepository.findByUserIdAndPostId(userId, postId);
        if (existing.isPresent()) {
            return SavedPostResponse.fromEntity(existing.get());
        }

        SavedPost savedPost = SavedPost.builder()
                .userId(userId)
                .postId(postId)
                .createdAt(Instant.now())
                .build();

        SavedPost saved = savedPostRepository.save(savedPost);
        return SavedPostResponse.fromEntity(saved);
    }

    /**
     * Unsaves a post for a user.
     */
    @Transactional
    public void unsavePost(UUID userId, UUID postId) {
        SavedPost savedPost = savedPostRepository.findByUserIdAndPostId(userId, postId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved post relationship not found"));

        savedPostRepository.delete(savedPost);
    }

    /**
     * Retrieves all saved posts for a user, avoiding N+1 queries.
     * Orders by saved_posts.created_at DESC.
     */
    @Transactional(readOnly = true)
    public List<SavedPostWithPostResponse> getSavedPosts(UUID userId) {
        List<SavedPost> savedPosts = savedPostRepository.findByUserIdOrderByCreatedAtDesc(userId);

        if (savedPosts.isEmpty()) {
            return List.of();
        }

        List<UUID> postIds = savedPosts.stream()
                .map(SavedPost::getPostId)
                .collect(Collectors.toList());

        List<Post> posts = postRepository.findAllByIdIn(postIds);

        List<UUID> authorIds = posts.stream()
                .map(Post::getUserId)
                .distinct()
                .collect(Collectors.toList());

        List<Profile> profiles = profileRepository.findAllByIdIn(authorIds);

        Map<UUID, ProfileResponse> profileMap = profiles.stream()
                .collect(Collectors.toMap(
                        Profile::getId,
                        ProfileResponse::fromEntity,
                        (existing, replacement) -> existing
                ));

        Map<UUID, PostResponse> postMap = posts.stream()
                .collect(Collectors.toMap(
                        Post::getId,
                        post -> PostResponse.fromEntity(post, profileMap.get(post.getUserId())),
                        (existing, replacement) -> existing
                ));

        return savedPosts.stream().map(savedPost -> {
            PostResponse postResponse = postMap.get(savedPost.getPostId());
            return SavedPostWithPostResponse.builder()
                    .savedPost(SavedPostResponse.fromEntity(savedPost))
                    .post(postResponse)
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Retrieves a single saved post.
     */
    @Transactional(readOnly = true)
    public SavedPostWithPostResponse getSavedPost(UUID userId, UUID postId) {
        SavedPost savedPost = savedPostRepository.findByUserIdAndPostId(userId, postId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved post relationship not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        Profile profile = profileRepository.findById(post.getUserId()).orElse(null);
        PostResponse postResponse = PostResponse.fromEntity(post, ProfileResponse.fromEntity(profile));

        return SavedPostWithPostResponse.builder()
                .savedPost(SavedPostResponse.fromEntity(savedPost))
                .post(postResponse)
                .build();
    }

    /**
     * Checks if a post is saved by a user.
     */
    @Transactional(readOnly = true)
    public boolean isSaved(UUID userId, UUID postId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post", "id", postId);
        }

        return savedPostRepository.existsByUserIdAndPostId(userId, postId);
    }

    /**
     * Returns the saved status for a post and user.
     */
    @Transactional(readOnly = true)
    public SavedPostStatusResponse getSavedStatus(UUID userId, UUID postId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post", "id", postId);
        }

        boolean saved = savedPostRepository.existsByUserIdAndPostId(userId, postId);

        return SavedPostStatusResponse.builder()
                .postId(postId)
                .userId(userId)
                .saved(saved)
                .build();
    }
}
