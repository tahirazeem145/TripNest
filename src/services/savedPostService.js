import { supabase } from '../lib/supabase'

export const savedPostService = {
  /**
   * Save a post
   */
  async savePost(userId, postId) {
    const { error } = await supabase
      .from('saved_posts')
      .insert({ user_id: userId, post_id: postId })

    if (error) {
      console.error('Error saving post:', error)
      throw error
    }
  },

  /**
   * Unsave a post
   */
  async unsavePost(userId, postId) {
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId)

    if (error) {
      console.error('Error unsaving post:', error)
      throw error
    }
  },

  /**
   * Check if a single post is saved by the user
   */
  async isPostSaved(userId, postId) {
    if (!userId || !postId) return false
    const { data, error } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle()

    if (error) {
      console.error('Error checking saved status:', error)
      throw error
    }
    return !!data
  },

  /**
   * Batch check which posts from a given list are saved by the user.
   * Returns a Set of post IDs.
   */
  async batchGetSavedStatus(userId, postIds) {
    if (!userId || !postIds || postIds.length === 0) return new Set()
    
    const { data, error } = await supabase
      .from('saved_posts')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds)

    if (error) {
      console.error('Error batch checking saved status:', error)
      throw error
    }

    return new Set((data || []).map((row) => row.post_id))
  },

  /**
   * Get all posts saved by the user.
   * Leverages safe two-step profile lookup.
   */
  async getSavedPosts(userId) {
    if (!userId) return []

    // 1. Fetch saved_posts list sorted by saved timestamp
    const { data: savedRecords, error: savedError } = await supabase
      .from('saved_posts')
      .select('post_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (savedError) {
      console.error('Error fetching saved posts records:', savedError)
      throw savedError
    }

    if (!savedRecords || savedRecords.length === 0) return []

    // 2. Fetch corresponding posts using IN filter
    const postIds = savedRecords.map((r) => r.post_id)
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .in('id', postIds)

    if (postsError) {
      console.error('Error fetching posts for saved feed:', postsError)
      throw postsError
    }

    if (!posts || posts.length === 0) return []

    // 3. Batch-fetch profile records for author mappings (safe 2-step approach)
    const authorIds = [...new Set(posts.map((p) => p.user_id))]
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, profile_photo')
      .in('id', authorIds)

    if (profilesError) {
      console.error('Error fetching profiles for saved feed:', profilesError)
    }

    const profileMap = {}
    if (profiles) {
      profiles.forEach((p) => {
        profileMap[p.id] = p
      })
    }

    // Map profiles to posts
    const postsWithProfiles = posts.map((post) => ({
      ...post,
      profile: profileMap[post.user_id] || null,
    }))

    // 4. Map them back to the original order of savedRecords (newest saved first)
    const postMap = {}
    postsWithProfiles.forEach((p) => {
      postMap[p.id] = p
    })

    return savedRecords
      .map((record) => postMap[record.post_id])
      .filter(Boolean) // Filter out any posts that might have been deleted since saving
  }
}
