import { apiClient } from './apiClient'

export const savedPostService = {
  /**
   * Save a post (authenticated user is derived from JWT).
   */
  async savePost(userId, postId) {
    // Backend overrides userId, only postId is required.
    await apiClient.post('/api/saved-posts', { postId })
  },

  /**
   * Unsave a post.
   */
  async unsavePost(userId, postId) {
    await apiClient.delete(`/api/saved-posts?postId=${postId}`)
  },

  /**
   * Check if a single post is saved by the user.
   */
  async isPostSaved(userId, postId) {
    if (!userId || !postId) return false
    const result = await apiClient.get(`/api/saved-posts/check/${postId}/${userId}`)
    // Backend returns { saved: true/false }
    return result?.saved ?? false
  },

  /**
   * Batch check which posts from a list are saved by the user.
   * Since the backend lacks a batch endpoint, we call the single check for each ID.
   * Returns a Set of saved post IDs.
   */
  async batchGetSavedStatus(userId, postIds) {
    if (!userId || !postIds || postIds.length === 0) return new Set()
    const checks = await Promise.all(
      postIds.map((postId) => this.isPostSaved(userId, postId).then((saved) => ({ postId, saved })))
    )
    return new Set(checks.filter((c) => c.saved).map((c) => c.postId))
  },

  /**
   * Get all posts saved by the user (includes post data and author profile).
   */
  async getSavedPosts(userId) {
    if (!userId) return []
    // Backend returns array of SavedPostWithPostResponse objects.
    return await apiClient.get(`/api/saved-posts/user/${userId}`)
  }
}
