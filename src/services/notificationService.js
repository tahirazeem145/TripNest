import { supabase } from '../lib/supabase'

export const notificationService = {
  /**
   * Fetch all notifications for the user.
   * Maps actor profiles safely in a two-step approach.
   */
  async getNotifications(userId) {
    if (!userId) return []

    // Step 1: Fetch notification rows
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }

    if (!notifications || notifications.length === 0) return []

    // Step 2: Fetch actor profiles
    const actorIds = [...new Set(notifications.map((n) => n.actor_id))]
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, profile_photo')
      .in('id', actorIds)

    if (profilesError) {
      console.error('Error fetching actor profiles:', profilesError)
    }

    const profileMap = {}
    if (profiles) {
      profiles.forEach((p) => {
        profileMap[p.id] = p
      })
    }

    // Step 3: Attach profile to notifications
    return notifications.map((notification) => ({
      ...notification,
      actorProfile: profileMap[notification.actor_id] || null
    }))
  },

  /**
   * Fetch only the unread count
   */
  async getUnreadNotificationCount(userId) {
    if (!userId) return 0
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error fetching unread count:', error)
      throw error
    }
    return count || 0
  },

  /**
   * Mark a single notification as read
   */
  async markNotificationAsRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  },

  /**
   * Mark all unread notifications of the user as read
   */
  async markAllNotificationsAsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) {
      console.error('Error deleting notification:', error)
      throw error
    }
  },

  /**
   * Subscribe to real-time changes in notifications table
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
