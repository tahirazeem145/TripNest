import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import RightSidebar from '../components/layout/RightSidebar'
import MobileNav from '../components/layout/MobileNav'
import FeedHeader from '../components/feed/FeedHeader'
import FilterBar from '../components/feed/FilterBar'
import PostCard from '../components/feed/PostCard'
import EmptyFeed from '../components/feed/EmptyFeed'

// 3 Fictional/Demo Travel Posts
const MOCK_POSTS = [
  {
    id: 1,
    user: 'Arjun Kumar',
    userInitials: 'AK',
    location: 'Munnar, Kerala',
    description: 'Misty mornings and endless green hills. Munnar never disappoints.',
    tags: ['#Munnar', '#Kerala', '#Mountains'],
    imageUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=800',
    likes: 128,
    comments: 24,
    saved: 42,
    category: 'Mountains'
  },
  {
    id: 2,
    user: 'Sarah Thomas',
    userInitials: 'ST',
    location: 'Goa, India',
    description: 'Golden hour by the sea.',
    tags: ['#Goa', '#Beach', '#Sunset'],
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    likes: 245,
    comments: 18,
    saved: 89,
    category: 'Beaches'
  },
  {
    id: 3,
    user: 'Rahul Mehta',
    userInitials: 'RM',
    location: 'Jaipur, Rajasthan',
    description: 'Exploring the colors and architecture of the Pink City.',
    tags: ['#Jaipur', '#India', '#Heritage'],
    imageUrl: 'https://images.unsplash.com/photo-1477584305590-38772fc3333d?auto=format&fit=crop&q=80&w=800',
    likes: 192,
    comments: 32,
    saved: 56,
    category: 'Heritage'
  }
]

export default function Home() {
  const { user, profile } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'Traveler'

  // Filter posts based on Search and active Filter Category
  const filteredPosts = MOCK_POSTS.filter((post) => {
    const matchesSearch = 
      post.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = 
      activeFilter === 'All' || 
      post.category.toLowerCase() === activeFilter.toLowerCase()

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

          {/* Posts Feed Grid */}
          <div className="space-y-6">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
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
