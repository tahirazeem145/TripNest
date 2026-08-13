package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing a follow relationship coupled with the profile of the target user.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowWithProfileResponse {
    private FollowResponse follow;
    private ProfileResponse profile;
}
