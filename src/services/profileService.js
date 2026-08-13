import { apiClient } from './apiClient'
import { mapProfile } from '../utils/adapters'

export const profileService = {
  // Get all profiles
  async getProfiles() {
    const data = await apiClient.get('/api/profiles')
    return data ? data.map(mapProfile) : []
  },

  // Get a single profile by ID
  async getProfile(userId) {
    const data = await apiClient.get(`/api/profiles/${userId}`)
    return mapProfile(data)
  },

  // Get profile by email
  async getProfileByEmail(email) {
    const data = await apiClient.get(`/api/profiles/email/${email}`)
    return mapProfile(data)
  },

  // Update a profile
  async updateProfile(userId, profileData) {
    const requestData = {
      fullName: profileData.full_name || profileData.fullName,
      bio: profileData.bio,
      profilePhoto: profileData.profile_photo || profileData.profilePhoto
    }
    const data = await apiClient.put(`/api/profiles/${userId}`, requestData)
    return mapProfile(data)
  }
}

