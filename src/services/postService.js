import { supabase } from '../lib/supabase'

export const postService = {
  // Fetch all posts ordered by created_at DESC, with author profile info
  async getPosts() {
    // Step 1: Fetch all posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (postsError) {
      console.error('Error fetching posts:', postsError)
      throw postsError
    }

    if (!posts || posts.length === 0) return []

    // Step 2: Collect unique user_ids and fetch their profiles
    const userIds = [...new Set(posts.map((p) => p.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, profile_photo')
      .in('id', userIds)

    // Build a lookup map
    const profileMap = {}
    if (profiles) {
      profiles.forEach((p) => { profileMap[p.id] = p })
    }

    // Step 3: Attach profile to each post
    return posts.map((post) => ({
      ...post,
      profile: profileMap[post.user_id] || null
    }))
  },

  // Insert a new post
  async createPost(postData) {
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()

    if (error) {
      console.error('Error creating post:', error)
      throw error
    }
    return data[0]
  },

  // Delete a post by ID
  async deletePost(postId) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) {
      console.error('Error deleting post:', error)
      throw error
    }
  }
}
