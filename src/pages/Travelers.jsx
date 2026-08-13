import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { profileService } from '../services/profileService'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import RightSidebar from '../components/layout/RightSidebar'
import MobileNav from '../components/layout/MobileNav'
import TravelerCard from '../components/feed/TravelerCard'

export default function Travelers() {
  const { user } = useAuth()
  const [travelers, setTravelers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function fetchTravelers() {
    setLoading(true)
    setError('')
    try {
      // Fetch all user profiles via Spring Boot API
      const data = await profileService.getProfiles()

      // Exclude logged in user
      const filtered = (data || []).filter((profile) => profile.id !== user?.id)
      setTravelers(filtered)
    } catch (err) {
      console.error('Failed to load travelers:', err)
      setError('Unable to load travelers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTravelers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const filteredTravelers = travelers.filter((traveler) => {
    const matchesSearch = 
      (traveler.full_name && traveler.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (traveler.email && traveler.email.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-16 lg:pb-0">
      <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <div className="flex max-w-7xl w-full mx-auto flex-1">
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        <main className="flex-1 p-6 max-w-2xl mx-auto w-full lg:max-w-none">
          <h1 className="text-3xl font-display font-bold mb-2">Discover Travelers</h1>
          <p className="text-slate-400 mb-8">Connect with other global explorers on TripNest.</p>

          {/* Search bar */}
          <div className="mb-8 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search travelers..."
              className="glass-input text-sm"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-10 h-10 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Loading travelers...</p>
            </div>
          ) : error ? (
            <div className="glass-card p-8 text-center border-slate-800 bg-slate-900/20 max-w-xl mx-auto py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button onClick={fetchTravelers} className="btn-primary max-w-xs mx-auto">
                Retry
              </button>
            </div>
          ) : filteredTravelers.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTravelers.map((traveler) => (
                <TravelerCard
                  key={traveler.id}
                  traveler={traveler}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center border-slate-800 bg-slate-900/20 max-w-xl mx-auto py-12">
              <span className="text-3xl mb-3 block">🔍</span>
              <p className="text-slate-400 text-sm italic">No travelers found.</p>
            </div>
          )}
        </main>

        <RightSidebar />
      </div>

      <MobileNav />
    </div>
  )
}
