import { supabase } from '../lib/supabase'

export const commentService = {
  /**
   * Fetch comments for a single post, with commenter profile data.
   * Uses the safe two-step approach: fetch comments, then batch-fetch profiles.
   */
  async getComments(postId) {
    // Step 1: Fetch comments for this post
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', error)
      throw error
    }

    if (!comments || comments.length === 0) return []

    // Step 2: Collect unique user IDs and fetch their profiles
    const userIds = [...new Set(comments.map((c) => c.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, profile_photo')
      .in('id', userIds)

    // Build a lookup map
    const profileMap = {}
    if (profiles) {
      profiles.forEach((p) => { profileMap[p.id] = p })
    }

    // Step 3: Attach profile to each comment
    return comments.map((comment) => ({
      ...comment,
      profile: profileMap[comment.user_id] || null
    }))
  },

  /**
   * Add a new comment to a post.
   */
  async addComment(postId, userId, content) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: userId, content: content.trim() })
      .select()

    if (error) {
      console.error('Error adding comment:', error)
      throw error
    }
    return data[0]
  },

  /**
   * Update a comment's content.
   */
  async updateComment(commentId, content) {
    const { data, error } = await supabase
      .from('comments')
      .update({ content: content.trim() })
      .eq('id', commentId)
      .select()

    if (error) {
      console.error('Error updating comment:', error)
      throw error
    }
    return data[0]
  },

  /**
   * Delete a comment by its ID.
   */
  async deleteComment(commentId) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      console.error('Error deleting comment:', error)
      throw error
    }
  },

  /**
   * Batch-fetch comment counts for an array of post IDs.
   * Returns a map: { postId: count }
   */
  async getCommentCounts(postIds) {
    if (!postIds || postIds.length === 0) return {}

    const { data, error } = await supabase
      .from('comments')
      .select('post_id')
      .in('post_id', postIds)

    if (error) {
      console.error('Error fetching comment counts:', error)
      throw error
    }

    const counts = {}
    postIds.forEach((id) => { counts[id] = 0 })
    if (data) {
      data.forEach((row) => {
        counts[row.post_id] = (counts[row.post_id] || 0) + 1
      })
    }
    return counts
  }
}
