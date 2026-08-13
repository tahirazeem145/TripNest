import { apiClient } from './apiClient'
import { mapComment } from '../utils/adapters'

export const commentService = {
  /**
   * Fetch comments for a post, with commenter profile data.
   */
  async getComments(postId) {
    const data = await apiClient.get(`/api/comments/post/${postId}`)
    return data ? data.map(mapComment) : []
  },

  /**
   * Fetch a single comment by ID.
   */
  async getComment(commentId) {
    const data = await apiClient.get(`/api/comments/${commentId}`)
    return mapComment(data)
  },

  /**
   * Add a new comment to a post.
   * Payload should include postId and content; backend derives user from JWT.
   */
  async addComment(postId, content) {
    const data = await apiClient.post('/api/comments', { postId, content })
    return mapComment(data)
  },

  /**
   * Update a comment's content.
   */
  async updateComment(commentId, content) {
    const data = await apiClient.put(`/api/comments/${commentId}`, { content })
    return mapComment(data)
  },

  /**
   * Delete a comment.
   */
  async deleteComment(commentId) {
    return await apiClient.delete(`/api/comments/${commentId}`)
  },

  /**
   * Get comment counts for multiple post IDs.
   */
  async getCommentCounts(postIds) {
    // Assuming backend provides an endpoint to batch fetch counts; if not, fallback to empty object.
    // No such endpoint defined, so return empty object for now.
    return {}
  }
}
