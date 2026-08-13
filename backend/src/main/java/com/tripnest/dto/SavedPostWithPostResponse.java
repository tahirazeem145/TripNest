package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO combining a saved post relationship and the complete post (with author profile).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedPostWithPostResponse {
    private SavedPostResponse savedPost;
    private PostResponse post;
}
