import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { notificationService } from '../services/notificationService'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import RightSidebar from '../components/layout/RightSidebar'
import MobileNav from '../components/layout/MobileNav'

function timeAgo(dateString) {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Notifications() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function fetchNotifications() {
    if (!user) {
      // No authenticated user — clear loading state so page renders
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await notificationService.getNotifications(user.id)
      setNotifications(data || [])
    } catch (err) {
      console.error('Failed to load notifications:', err)
      setError('Unable to load notifications. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Subscribe to real-time notifications on this page to update live
  useEffect(() => {
    fetchNotifications()

    if (!user) return

    const channel = notificationService.subscribeToNotifications(user.id, (payload) => {
      // Refresh the notifications feed live when changes happen
      fetchNotifications()
    })

    return () => {
      if (channel) {
        channel.unsubscribe()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  async function handleMarkAllAsRead() {
    if (!user || notifications.length === 0) return
    try {
      await notificationService.markAllNotificationsAsRead(user.id)
      // Update locally
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      )
      // Dispatch custom event to notify Navbar and other components to update badges
      window.dispatchEvent(new Event('notifications_read'))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
      alert('Unable to update notifications.')
    }
  }

  async function handleNotificationClick(notification) {
    // 1. Mark as read in db
    if (!notification.is_read) {
      try {
        await notificationService.markNotificationAsRead(notification.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        )
        // Dispatch custom event to update navbar/mobile badges
        window.dispatchEvent(new Event('notifications_read'))
      } catch (err) {
        console.error('Failed to mark notification as read:', err)
      }
    }

    // 2. Navigation
    if (notification.type === 'follow') {
      navigate(`/profile/${notification.actor_id}`)
    } else if (notification.type === 'like' || notification.type === 'comment') {
      // In a real app we might scroll to post. Here, we navigate home or profile
      navigate('/home')
    }
  }

  async function handleDeleteNotification(e, notificationId) {
    e.stopPropagation()
    try {
      await notificationService.deleteNotification(notificationId)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      window.dispatchEvent(new Event('notifications_read'))
    } catch (err) {
      console.error('Failed to delete notification:', err)
      alert('Unable to delete notification.')
    }
  }

  function getInitials(displayName) {
    if (!displayName || typeof displayName !== 'string' || displayName.trim() === '') return '?'
    return displayName
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-16 lg:pb-0">
      <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <div className="flex max-w-7xl w-full mx-auto flex-1">
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        <main className="flex-1 p-6 max-w-2xl mx-auto w-full lg:max-w-none">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2">Notifications</h1>
              <p className="text-slate-400">Keep track of your community interaction.</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 px-3.5 py-2 rounded-xl border border-brand-500/20 transition"
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-10 h-10 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="glass-card p-8 text-center border-slate-800 bg-slate-900/20 max-w-xl mx-auto py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button onClick={fetchNotifications} className="btn-primary max-w-xs mx-auto">
                Retry
              </button>
            </div>
          ) : notifications.length > 0 ? (
            <div className="glass-card border-slate-800 bg-slate-900/20 divide-y divide-slate-800/60 overflow-hidden max-w-2xl">
              {notifications.map((notification) => {
                const actorName = notification.actorProfile?.full_name || notification.actorProfile?.email || 'Traveler'
                const initials = getInitials(actorName)
                // Fallback message if the DB trigger stored NULL (e.g. profile not found at trigger time)
                const fallbackMsg =
                  notification.type === 'like' ? `${actorName} liked your photo.`
                  : notification.type === 'comment' ? `${actorName} commented on your photo.`
                  : `${actorName} started following you.`
                const displayMessage = notification.message || fallbackMsg
                const typeEmoji =
                  notification.type === 'like'
                    ? '❤️'
                    : notification.type === 'comment'
                    ? '💬'
                    : '👤'

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start justify-between gap-4 p-4 hover:bg-slate-800/20 cursor-pointer transition ${
                      !notification.is_read ? 'bg-brand-500/5 border-l-2 border-l-brand-500' : ''
                    }`}
                  >
                    <div className="flex gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300 border border-slate-700">
                          {initials}
                        </div>
                        <span className="absolute -bottom-1 -right-1 bg-slate-950 text-xs w-5 h-5 rounded-full flex items-center justify-center border border-slate-800">
                          {typeEmoji}
                        </span>
                      </div>

                      {/* Content details */}
                      <div className="min-w-0">
                        <p className={`text-sm text-slate-200 leading-snug ${!notification.is_read ? 'font-semibold text-white' : ''}`}>
                          {displayMessage}
                        </p>
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          {timeAgo(notification.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteNotification(e, notification.id)}
                      className="p-1 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800/40 transition flex-shrink-0"
                      title="Delete notification"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="glass-card p-12 text-center border-slate-800 bg-slate-900/20 max-w-xl mx-auto py-16 flex flex-col items-center">
              <span className="text-4xl mb-4">🎉</span>
              <h2 className="text-lg font-bold text-white mb-2">You're all caught up!</h2>
              <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                No notifications yet. Interact with other travelers to see activity here.
              </p>
            </div>
          )}
        </main>

        <RightSidebar />
      </div>

      <MobileNav />
    </div>
  )
}
