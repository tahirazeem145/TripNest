import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { storageService } from '../services/storageService'
import { postService } from '../services/postService'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import RightSidebar from '../components/layout/RightSidebar'
import MobileNav from '../components/layout/MobileNav'
import Avatar from '../components/common/Avatar'
import PostCard from '../components/feed/PostCard'
import EmptyFeed from '../components/feed/EmptyFeed'

export default function Profile() {
  const { user, profile } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'Traveler'

  async function fetchUserPosts() {
    if (!user) return
    setLoading(true)
    try {
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (err) {
      console.error('Failed to load user posts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserPosts()
  }, [user])

  async function handleDeletePost(postId, imageUrl) {
    try {
      await postService.deletePost(postId)
      await storageService.deletePhoto(imageUrl)
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
    } catch (err) {
      console.error('Failed to delete post:', err)
      alert('Could not delete post. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-16 lg:pb-0">
      <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <div className="flex max-w-7xl w-full mx-auto flex-1">
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        <main className="flex-1 p-6 max-w-2xl mx-auto w-full lg:max-w-none">
          <h1 className="text-3xl font-display font-bold mb-2">Profile</h1>
          <p className="text-slate-400 mb-8">Manage your traveler identity.</p>

          <div className="glass-card p-6 mb-8 border-slate-800 bg-slate-900/40">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <Avatar className="w-20 h-20 text-2xl" />
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{displayName}</h2>
                <p className="text-sm text-slate-400 mb-3">{user?.email}</p>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  {profile?.role || 'USER'} Account
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-6">Your Journeys</h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Loading your journeys...</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
              ))}
            </div>
          ) : (
            <EmptyFeed />
          )}
        </main>

        <RightSidebar />
      </div>

      <MobileNav />
    </div>
  )
}
