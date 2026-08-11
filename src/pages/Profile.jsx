import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import RightSidebar from '../components/layout/RightSidebar'
import MobileNav from '../components/layout/MobileNav'
import Avatar from '../components/common/Avatar'

export default function Profile() {
  const { user, profile } = useAuth()
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'Traveler'

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-16 lg:pb-0">
      <Navbar />

      <div className="flex max-w-7xl w-full mx-auto flex-1">
        <Sidebar />

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

          <div className="glass-card p-8 text-center border-slate-800 bg-slate-900/20 max-w-xl mx-auto py-12">
            <span className="text-4xl mb-4 block">📸</span>
            <h2 className="text-xl font-bold text-white mb-2">No travel posts yet</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              When you upload travel photos, they will display here as your travel timeline.
            </p>
            <button onClick={() => alert('Photo sharing is coming next!')} className="btn-primary max-w-xs mx-auto">
              Share Your First Journey
            </button>
          </div>
        </main>

        <RightSidebar />
      </div>

      <MobileNav />
    </div>
  )
}
