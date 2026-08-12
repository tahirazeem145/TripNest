import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { postService } from '../services/postService'
import { followService } from '../services/followService'
import { likeService } from '../services/likeService'
import { commentService } from '../services/commentService'
import { savedPostService } from '../services/savedPostService'
import { supabase } from '../lib/supabase'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import RightSidebar from '../components/layout/RightSidebar'
import MobileNav from '../components/layout/MobileNav'
import PostCard from '../components/feed/PostCard'

export default function Following() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Engagement data maps
  const [likeCounts, setLikeCounts] = useState({})
  const [userLikes, setUserLikes] = useState(new Set())
  const [commentCounts, setCommentCounts] = useState({})
  const [userSaves, setUserSaves] = useState(new Set())

  async function fetchFollowingFeed() {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      // 1. Get the following IDs
      const followingIds = await followService.getFollowingIds(user.id)

      if (followingIds.length === 0) {
        setPosts([])
        setLoading(false)
        return
      }

      // 2. Fetch posts belonging to followed users
      const { data: rawPosts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })

      if (postsError) throw postsError

      if (!rawPosts || rawPosts.length === 0) {
        setPosts([])
        setLoading(false)
        return
      }

      // 3. Batch-fetch profile records for author mappings (safe 2-step approach)
      const userIds = [...new Set(rawPosts.map((p) => p.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, profile_photo')
        .in('id', userIds)

      const profileMap = {}
      if (profiles) {
        profiles.forEach((p) => {
          profileMap[p.id] = p
        })
      }

      const postsWithProfiles = rawPosts.map((post) => ({
        ...post,
        profile: profileMap[post.user_id] || null,
      }))

      setPosts(postsWithProfiles)

      // 4. Batch fetch engagement data
      const postIds = postsWithProfiles.map((p) => p.id)
      const [likesMap, userLikedSet, commentsMap, userSavedSet] = await Promise.all([
        likeService.getLikeCounts(postIds),
        likeService.getUserLikes(postIds, user.id),
        commentService.getCommentCounts(postIds),
        savedPostService.batchGetSavedStatus(user.id, postIds)
      ])

      setLikeCounts(likesMap)
      setUserLikes(userLikedSet)
      setCommentCounts(commentsMap)
      setUserSaves(userSavedSet)
    } catch (err) {
      console.error('Failed to load following feed:', err)
      setError('Unable to load following feed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFollowingFeed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  async function handleDeletePost(postId, imageUrl) {
    try {
      await postService.deletePost(postId)
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
          <h1 className="text-3xl font-display font-bold mb-2">Following Feed</h1>
          <p className="text-slate-400 mb-8">Journeys from travelers you follow.</p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-10 h-10 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Loading following feed...</p>
            </div>
          ) : error ? (
            <div className="glass-card p-8 text-center border-slate-800 bg-slate-900/20 max-w-xl mx-auto py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button onClick={fetchFollowingFeed} className="btn-primary max-w-xs mx-auto">
                Retry
              </button>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6 max-w-2xl">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={handleDeletePost}
                  likeCount={likeCounts[post.id] || 0}
                  commentCount={commentCounts[post.id] || 0}
                  hasLiked={userLikes.has(post.id)}
                  isSaved={userSaves.has(post.id)}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center border-slate-800 bg-slate-900/20 max-w-xl mx-auto py-16 flex flex-col items-center">
              <span className="text-4xl mb-4 block">👋</span>
              <h2 className="text-xl font-bold text-white mb-2">No journeys from people you follow yet.</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
                Follow other travelers to see their adventures in this feed.
              </p>
              <Link to="/travelers" className="btn-primary max-w-xs text-center inline-block">
                Discover Travelers
              </Link>
            </div>
          )}
        </main>

        <RightSidebar />
      </div>

      <MobileNav />
    </div>
  )
}
