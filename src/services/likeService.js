import { supabase } from '../lib/supabase'

export const likeService = {
  /**
   * Batch-fetch like counts for an array of post IDs.
   * Returns a map: { postId: count }
   */
  async getLikeCounts(postIds) {
    if (!postIds || postIds.length === 0) return {}

    const { data, error } = await supabase
      .from('likes')
      .select('post_id')
      .in('post_id', postIds)

    if (error) {
      console.error('Error fetching like counts:', error)
      throw error
    }

    // Count occurrences per post_id
    const counts = {}
    postIds.forEach((id) => { counts[id] = 0 })
    if (data) {
      data.forEach((row) => {
        counts[row.post_id] = (counts[row.post_id] || 0) + 1
      })
    }
    return counts
  },

  /**
   * Batch-check which posts the current user has liked.
   * Returns a Set of post IDs the user has liked.
   */
  async getUserLikes(postIds, userId) {
    if (!postIds || postIds.length === 0 || !userId) return new Set()

    const { data, error } = await supabase
      .from('likes')
      .select('post_id')
      .in('post_id', postIds)
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user likes:', error)
      throw error
    }

    return new Set((data || []).map((row) => row.post_id))
  },

  /**
   * Like a post. Inserts a row into the likes table.
   */
  async likePost(postId, userId) {
    const { error } = await supabase
      .from('likes')
      .insert({ post_id: postId, user_id: userId })

    if (error) {
      console.error('Error liking post:', error)
      throw error
    }
  },

  /**
   * Unlike a post. Deletes the user's like row for that post.
   */
  async unlikePost(postId, userId) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error unliking post:', error)
      throw error
    }
  }
}
