import { supabase } from '../lib/supabase'
import { apiClient } from './apiClient'
import { mapNotification } from '../utils/adapters'

export const notificationService = {
  /**
   * Fetch all notifications for the user.
   * Uses backend endpoint and returns notifications with actor profiles attached.
   */
  async getNotifications(userId) {
    if (!userId) return []
    // Backend returns notifications with actorProfile already attached.
    const data = await apiClient.get(`/api/notifications/user/${userId}`)
    return (data || []).map(mapNotification)
  },

  /**
   * Fetch only the unread count for the user.
   */
  async getUnreadNotificationCount(userId) {
    if (!userId) return 0
    const result = await apiClient.get(`/api/notifications/user/${userId}/unread-count`)
    // Backend returns { count: number }
    return result?.count ?? 0
  },

  /**
   * Mark a single notification as read.
   */
  async markNotificationAsRead(notificationId) {
    await apiClient.put(`/api/notifications/${notificationId}/read`)
  },

  /**
   * Mark all notifications as read for a user.
   */
  async markAllNotificationsAsRead(userId) {
    await apiClient.put(`/api/notifications/user/${userId}/read-all`)
  },

  /**
   * Delete a notification.
   */
  async deleteNotification(notificationId) {
    await apiClient.delete(`/api/notifications/${notificationId}`)
  },

  /**
   * Subscribe to real-time changes in notifications table.
   */
  subscribeToNotifications(userId, callback) {
    if (!userId) return null
    const uniqueId = Math.random().toString(36).substring(2, 10);
    return supabase
      .channel(`realtime-notifications-${userId}-${uniqueId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()
  }
}
