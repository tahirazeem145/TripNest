import { supabase } from '../lib/supabase'

export const followService = {
  /**
   * Count how many followers a user has
   */
  async getFollowerCount(userId) {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)

    if (error) {
      console.error('Error fetching follower count:', error)
      throw error
    }
    return count || 0
  },

  /**
   * Count how many users a user is following
   */
  async getFollowingCount(userId) {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)

    if (error) {
      console.error('Error fetching following count:', error)
      throw error
    }
    return count || 0
  },

  /**
   * Check if followerUserId is following targetUserId
   */
  async isFollowing(followerUserId, targetUserId) {
    if (!followerUserId || !targetUserId) return false
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerUserId)
      .eq('following_id', targetUserId)
      .maybeSingle()

    if (error) {
      console.error('Error checking follow status:', error)
      throw error
    }
    return !!data
  },

  /**
   * Follow a user
   */
  async followUser(followerUserId, targetUserId) {
    if (followerUserId === targetUserId) {
      throw new Error('Self-following is not allowed.')
    }
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: followerUserId, following_id: targetUserId })

    if (error) {
      console.error('Error following user:', error)
      throw error
    }
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(followerUserId, targetUserId) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerUserId)
      .eq('following_id', targetUserId)

    if (error) {
      console.error('Error unfollowing user:', error)
      throw error
    }
  },

  /**
   * Get the array of user IDs that followerUserId is following
   */
  async getFollowingIds(followerUserId) {
    if (!followerUserId) return []
    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', followerUserId)

    if (error) {
      console.error('Error fetching following IDs:', error)
      throw error
    }
    return (data || []).map((row) => row.following_id)
  },

  /**
   * Get list of profiles who follow the given userId
   */
  async getFollowers(userId) {
    // 1. Fetch follows rows
    const { data: follows, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId)

    if (error) {
      console.error('Error fetching followers list:', error)
      throw error
    }
    if (!follows || follows.length === 0) return []

    // 2. Fetch profiles
    const followerIds = follows.map((f) => f.follower_id)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, profile_photo, bio')
      .in('id', followerIds)

    if (profilesError) {
      console.error('Error fetching follower profiles:', profilesError)
      throw profilesError
    }
    return profiles || []
  },

  /**
   * Get list of profiles followed by the given userId
   */
  async getFollowing(userId) {
    // 1. Fetch follows rows
    const { data: follows, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)

    if (error) {
      console.error('Error fetching following list:', error)
      throw error
    }
    if (!follows || follows.length === 0) return []

    // 2. Fetch profiles
    const followingIds = follows.map((f) => f.following_id)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, profile_photo, bio')
      .in('id', followingIds)

    if (profilesError) {
      console.error('Error fetching following profiles:', profilesError)
      throw profilesError
    }
    return profiles || []
  }
}
