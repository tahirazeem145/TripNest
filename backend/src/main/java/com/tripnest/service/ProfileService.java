package com.tripnest.service;

import com.tripnest.dto.ProfileResponse;
import com.tripnest.dto.UpdateProfileRequest;
import com.tripnest.entity.Profile;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service handling business logic for Profile management.
 */
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;

    /**
     * Gets a single profile by user UUID.
     * Throws ResourceNotFoundException if profile does not exist.
     */
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(UUID userId) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", "id", userId));
        return ProfileResponse.fromEntity(profile);
    }

    /**
     * Gets all profiles in the system, sorted by created_at descending.
     */
    @Transactional(readOnly = true)
    public List<ProfileResponse> getAllProfiles() {
        return profileRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(ProfileResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Batch gets profiles by a list of user UUIDs.
     */
    @Transactional(readOnly = true)
    public List<ProfileResponse> getProfilesByIds(List<UUID> userIds) {
        return profileRepository.findAllByIdIn(userIds)
                .stream()
                .map(ProfileResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Gets a single profile by email address.
     * Throws ResourceNotFoundException if email not found.
     */
    @Transactional(readOnly = true)
    public ProfileResponse getProfileByEmail(String email) {
        Profile profile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", "email", email));
        return ProfileResponse.fromEntity(profile);
    }

    /**
     * Updates editable profile fields for a user.
     * Saves changes to the database and returns the updated ProfileResponse.
     */
    @Transactional
    public ProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", "id", userId));

        if (request.getFullName() != null) {
            profile.setFullName(request.getFullName().trim());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio().trim());
        }
        if (request.getProfilePhoto() != null) {
            profile.setProfilePhoto(request.getProfilePhoto().trim());
        }

        Profile saved = profileRepository.save(profile);
        return ProfileResponse.fromEntity(saved);
    }
}
