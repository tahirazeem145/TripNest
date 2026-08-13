import { apiClient } from './apiClient'
import { mapPost } from '../utils/adapters'

export const postService = {
  // Fetch all posts
  async getPosts() {
    const data = await apiClient.get('/api/posts')
    return data ? data.map(mapPost) : []
  },

  // Fetch a single post by ID
  async getPost(postId) {
    const data = await apiClient.get(`/api/posts/${postId}`)
    return mapPost(data)
  },

  // Fetch posts for a specific user (userId derived from JWT if not provided)
  async getPostsByUser(userId) {
    const data = await apiClient.get(`/api/posts/user/${userId}`)
    return data ? data.map(mapPost) : []
  },

  // Create a new post (payload without userId; backend derives from JWT)
  async createPost(postData) {
    const data = await apiClient.post('/api/posts', postData)
    return mapPost(data)
  },

  // Update an existing post
  async updatePost(postId, postData) {
    const data = await apiClient.put(`/api/posts/${postId}`, postData)
    return mapPost(data)
  },

  // Delete a post
  async deletePost(postId) {
    return await apiClient.delete(`/api/posts/${postId}`)
  }
}
