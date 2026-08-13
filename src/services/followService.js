import { apiClient } from './apiClient'
import { mapProfile } from '../utils/adapters'

export const followService = {
  /**
   * Get follower count for a user.
   */
  async getFollowerCount(userId) {
    const followers = await apiClient.get(`/api/follows/followers/${userId}`)
    return (followers?.length) || 0
  },

  /**
   * Get following count for a user.
   */
  async getFollowingCount(userId) {
    const following = await apiClient.get(`/api/follows/following/${userId}`)
    return (following?.length) || 0
  },

  /**
   * Check if followerUserId follows targetUserId.
   */
  async isFollowing(followerUserId, targetUserId) {
    if (!followerUserId || !targetUserId) return false
    const status = await apiClient.get(`/api/follows/check/${followerUserId}/${targetUserId}`)
    return status?.following ?? false
  },

  /**
   * Follow a user.
   */
  async followUser(targetUserId) {
    // Backend derives followerId from JWT
    await apiClient.post('/api/follows', { followingId: targetUserId })
  },

  /**
   * Unfollow a user.
   */
  async unfollowUser(targetUserId) {
    // Backend derives followerId from JWT
    await apiClient.delete(`/api/follows?followingId=${targetUserId}`)
  },

  /**
   * Get IDs of users that the given follower is following.
   */
  async getFollowingIds(followerUserId) {
    const following = await apiClient.get(`/api/follows/following/${followerUserId}`)
    // Returns List<FollowWithProfileResponse> which has { follow, profile }
    return (following || []).map((item) => item.follow?.followingId)
  },

  /**
   * Get follower profiles for a user.
   */
  async getFollowers(userId) {
    const data = await apiClient.get(`/api/follows/followers/${userId}`)
    return (data || []).map(item => mapProfile(item.profile))
  },

  /**
   * Get following profiles for a user.
   */
  async getFollowing(userId) {
    const data = await apiClient.get(`/api/follows/following/${userId}`)
    return (data || []).map(item => mapProfile(item.profile))
  }
}
