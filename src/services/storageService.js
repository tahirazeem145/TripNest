import { supabase } from '../lib/supabase'

export const storageService = {
  // Upload a travel photograph to the 'travel-photos' bucket
  async uploadPhoto(file, userId) {
    const fileExt = file.name.split('.').pop()
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
    const filePath = `${userId}/${uniqueFileName}`

    const { data, error } = await supabase.storage
      .from('travel-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading photo:', error)
      throw error
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('travel-photos')
      .getPublicUrl(filePath)

    return publicUrlData.publicUrl
  },

  // Delete a travel photo from storage
  async deletePhoto(imageUrl) {
    try {
      // Parse the path out of the public URL
      // Expected URL format: https://[proj-id].supabase.co/storage/v1/object/public/travel-photos/[user-id]/[filename]
      const urlParts = imageUrl.split('/travel-photos/')
      if (urlParts.length < 2) return

      const filePath = urlParts[1]
      const { error } = await supabase.storage
        .from('travel-photos')
        .remove([filePath])

      if (error) {
        console.error('Error deleting photo from storage:', error)
      }
    } catch (err) {
      console.error('Failed to parse image URL for deletion:', err)
    }
  }
}
