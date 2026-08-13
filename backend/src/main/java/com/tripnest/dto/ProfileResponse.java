package com.tripnest.dto;

import com.tripnest.entity.Profile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO representing a profile returned by the REST APIs.
 * Matches JSON camelCase format.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private UUID id;
    private String fullName;
    private String email;
    private String profilePhoto;
    private String bio;
    private String role;
    private Instant createdAt;

    /**
     * Converts a Profile entity to a ProfileResponse DTO.
     */
    public static ProfileResponse fromEntity(Profile profile) {
        if (profile == null) {
            return null;
        }
        return ProfileResponse.builder()
                .id(profile.getId())
                .fullName(profile.getFullName())
                .email(profile.getEmail())
                .profilePhoto(profile.getProfilePhoto())
                .bio(profile.getBio())
                .role(profile.getRole())
                .createdAt(profile.getCreatedAt())
                .build();
    }
}
