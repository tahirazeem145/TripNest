import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import RightSidebar from '../components/layout/RightSidebar'
import MobileNav from '../components/layout/MobileNav'
import FeedHeader from '../components/feed/FeedHeader'
import FilterBar from '../components/feed/FilterBar'
import EmptyFeed from '../components/feed/EmptyFeed'

export default function Home() {
  const { user, profile } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'Traveler'

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

          {/* Posts Feed Grid - Now completely empty state as no real database posts exist yet */}
          <div className="space-y-6">
            <EmptyFeed />
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
