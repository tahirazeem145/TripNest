import { supabase } from '../lib/supabase'

export const postService = {
  // Fetch all posts ordered by created_at DESC
  async getPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profile:profiles (
          full_name,
          email,
          profile_photo
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
      throw error
    }
    return data
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
