import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import RightSidebar from '../components/layout/RightSidebar'
import MobileNav from '../components/layout/MobileNav'

export default function Explore() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-16 lg:pb-0">
      <Navbar />

      <div className="flex max-w-7xl w-full mx-auto flex-1">
        <Sidebar />

        <main className="flex-1 p-6 max-w-2xl mx-auto w-full lg:max-w-none">
          <h1 className="text-3xl font-display font-bold mb-2">Explore</h1>
          <p className="text-slate-400 mb-8">Discover destinations from around the world.</p>

          <div className="glass-card p-8 text-center border-slate-800 bg-slate-900/20 max-w-xl mx-auto py-16">
            <span className="text-4xl mb-4 block">🌍</span>
            <h2 className="text-xl font-bold text-white mb-2">Explore feed is coming soon!</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Soon you will be able to search, filter, and discover all shared travel experiences globally.
            </p>
            <button onClick={() => alert('Photo sharing is coming next!')} className="btn-primary max-w-xs mx-auto">
              Stay Tuned
            </button>
          </div>
        </main>

        <RightSidebar />
      </div>

      <MobileNav />
    </div>
  )
}
