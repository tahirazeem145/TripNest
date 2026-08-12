import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { postService } from '../services/postService'
import { storageService } from '../services/storageService'
import { likeService } from '../services/likeService'
import { commentService } from '../services/commentService'
import { savedPostService } from '../services/savedPostService'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import RightSidebar from '../components/layout/RightSidebar'
import MobileNav from '../components/layout/MobileNav'
import FeedHeader from '../components/feed/FeedHeader'
import FilterBar from '../components/feed/FilterBar'
import PostCard from '../components/feed/PostCard'
import EmptyFeed from '../components/feed/EmptyFeed'

export default function Home() {
  const { user, profile } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Feed states
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Like, comment, and save engagement data (batch-loaded)
  const [likeCounts, setLikeCounts] = useState({})     // { postId: number }
  const [userLikes, setUserLikes] = useState(new Set()) // Set of liked post IDs
  const [commentCounts, setCommentCounts] = useState({}) // { postId: number }
  const [userSaves, setUserSaves] = useState(new Set()) // Set of saved post IDs

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'Traveler'

  // Fetch posts from database, then batch-load engagement data
  async function fetchFeed() {
    setLoading(true)
    setError('')
    try {
      const data = await postService.getPosts()
      setPosts(data || [])

      // Batch-fetch likes, comments & saves for all loaded posts
      if (data && data.length > 0) {
        const postIds = data.map((p) => p.id)
        await fetchEngagement(postIds)
      } else {
        setLikeCounts({})
        setUserLikes(new Set())
        setCommentCounts({})
        setUserSaves(new Set())
      }
    } catch (err) {
      console.error('Failed to load journeys:', err)
      setError('Unable to load journeys. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Batch-load like counts, user-liked status, comment counts, and user-saved status
  async function fetchEngagement(postIds) {
    try {
      const [likesMap, userLikedSet, commentsMap, userSavedSet] = await Promise.all([
        likeService.getLikeCounts(postIds),
        user ? likeService.getUserLikes(postIds, user.id) : Promise.resolve(new Set()),
        commentService.getCommentCounts(postIds),
        user ? savedPostService.batchGetSavedStatus(user.id, postIds) : Promise.resolve(new Set())
      ])
      setLikeCounts(likesMap)
      setUserLikes(userLikedSet)
      setCommentCounts(commentsMap)
      setUserSaves(userSavedSet)
    } catch (err) {
      // Non-fatal: engagement data failed but posts still show
      console.error('Failed to load engagement data:', err)
    }
  }

  useEffect(() => {
    fetchFeed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle post deletion
  async function handleDeletePost(postId, imageUrl) {
    try {
      // 1. Delete database record
      await postService.deletePost(postId)
      
      // 2. Try to remove public image from Storage
      await storageService.deletePhoto(imageUrl)
      
      // 3. Refresh local posts
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
    } catch (err) {
      console.error('Failed to delete post:', err)
      alert('Could not delete post. Please try again.')
    }
  }

  // Filter posts dynamically in frontend
  const filteredPosts = posts.filter((post) => {
    // Search filter
    const matchesSearch = 
      post.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.description && post.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.tags && post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))

    // Category filter mapping
    // Since tags hold array elements like '#beach' or '#mountains'
    const matchesCategory = 
      activeFilter === 'All' || 
      (post.tags && post.tags.some((tag) => 
        tag.replace('#', '').toLowerCase() === activeFilter.toLowerCase().replace(/es$/, 's').replace(/s$/, '') ||
        tag.replace('#', '').toLowerCase().includes(activeFilter.toLowerCase().replace(/es$/, 's').replace(/s$/, ''))
      ))

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-16 lg:pb-0">
      <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      {/* Main Layout Container */}
      <div className="flex max-w-7xl w-full mx-auto flex-1">
        
        {/* Sidebar Nav */}
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        {/* Center Main Feed */}
        <main className="flex-1 px-4 py-6 md:p-6 max-w-2xl mx-auto w-full lg:max-w-none">
          
          {/* Welcome User Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/60 to-slate-900 border border-slate-800/60 flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-400 font-semibold tracking-wider uppercase mb-1">Authenticated Account</p>
              <h2 className="text-xl font-bold text-white">Welcome back, {displayName.split(' ')[0]}!</h2>
            </div>
            <span className="text-2xl">👋</span>
          </div>

          <FeedHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          
          <FilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

          {/* Posts Feed Area */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-10 h-10 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Loading journeys...</p>
              </div>
            ) : error ? (
              <div className="glass-card p-8 text-center border-slate-800 bg-slate-900/20 max-w-xl mx-auto py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <button onClick={fetchFeed} className="btn-primary max-w-xs mx-auto">
                  Retry
                </button>
              </div>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={handleDeletePost}
                  likeCount={likeCounts[post.id] || 0}
                  commentCount={commentCounts[post.id] || 0}
                  hasLiked={userLikes.has(post.id)}
                  isSaved={userSaves.has(post.id)}
                />
              ))
            ) : (
              <EmptyFeed />
            )}
          </div>

        </main>

        {/* Right Sidebar Widget Column */}
        <RightSidebar />

      </div>

      {/* Bottom Nav for Mobile layout */}
      <MobileNav />
    </div>
  )
}
