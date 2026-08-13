import { apiClient } from './apiClient'

// likeService primarily returns boolean, counts, or status objects which don't map directly to DTOs in a way that requires translation to snake_case.
// For the most part, the frontend expects `counts` or `likes`.
// Let's ensure the methods are correctly matching what the frontend components expect.

export const likeService = {
  /**
   * Batch get like counts for multiple posts.
   */
  async getLikeCounts(postIds) {
    if (!postIds || postIds.length === 0) return {}
    return await apiClient.get(`/api/likes/counts?postIds=${postIds.join(',')}`)
  },

  /**
   * Batch get which posts the user has liked from a list of postIds.
   */
  async getUserLikes(postIds, userId) {
    if (!postIds || postIds.length === 0 || !userId) return new Set()
    const result = await apiClient.get(`/api/likes/user?postIds=${postIds.join(',')}`)
    // Result is likely an array of post IDs the user liked
    return new Set(result || [])
  },

  /**
   * Like a post.
   */
  async likePost(postId) {
    // We don't send userId, backend uses JWT
    return await apiClient.post('/api/likes', { postId })
  },

  /**
   * Unlike a post.
   */
  async unlikePost(postId) {
    return await apiClient.delete(`/api/likes/${postId}`)
  }
}
