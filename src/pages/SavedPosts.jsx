import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { postService } from '../services/postService'
import { savedPostService } from '../services/savedPostService'
import { likeService } from '../services/likeService'
import { commentService } from '../services/commentService'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import RightSidebar from '../components/layout/RightSidebar'
import MobileNav from '../components/layout/MobileNav'
import PostCard from '../components/feed/PostCard'

export default function SavedPosts() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Engagement states
  const [likeCounts, setLikeCounts] = useState({})
  const [userLikes, setUserLikes] = useState(new Set())
  const [commentCounts, setCommentCounts] = useState({})

  async function fetchSavedPosts() {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const savedData = await savedPostService.getSavedPosts(user.id)
      setPosts(savedData)

      if (savedData.length > 0) {
        const postIds = savedData.map((p) => p.id)
        const [likesMap, userLikedSet, commentsMap] = await Promise.all([
          likeService.getLikeCounts(postIds),
          likeService.getUserLikes(postIds, user.id),
          commentService.getCommentCounts(postIds)
        ])
        setLikeCounts(likesMap)
        setUserLikes(userLikedSet)
        setCommentCounts(commentsMap)
      }
    } catch (err) {
      console.error('Failed to load saved posts:', err)
      setError('Unable to load saved posts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSavedPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Instant local remove on Unsave trigger
  function handleUnsaveLocal(postId) {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  // Handle post deletion
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
          <h1 className="text-3xl font-display font-bold mb-2">Saved Travels</h1>
          <p className="text-slate-400 mb-8">Travel posts and memories you have bookmarked.</p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-10 h-10 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Loading saved posts...</p>
            </div>
          ) : error ? (
            <div className="glass-card p-8 text-center border-slate-800 bg-slate-900/20 max-w-xl mx-auto py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button onClick={fetchSavedPosts} className="btn-primary max-w-xs mx-auto">
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
                  isSaved={true} // In SavedPosts page, all rendered cards are initially saved
                  onUnsave={handleUnsaveLocal}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center border-slate-800 bg-slate-900/20 max-w-xl mx-auto py-16 flex flex-col items-center">
              <span className="text-4xl mb-4 block">🔖</span>
              <h2 className="text-xl font-bold text-white mb-2">No saved travels yet</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
                Save interesting destinations and travel photos to find them here later.
              </p>
              <Link to="/home" className="btn-primary max-w-xs text-center inline-block">
                Discover Travels
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
