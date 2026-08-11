export default function RightSidebar() {
  const trendingDestinations = [
    { name: 'Munnar', posts: '1.2k posts', icon: '⛰️' },
    { name: 'Goa', posts: '2.5k posts', icon: '🏖️' },
    { name: 'Ooty', posts: '840 posts', icon: '🌲' },
    { name: 'Manali', posts: '1.8k posts', icon: '❄️' },
    { name: 'Jaipur', posts: '980 posts', icon: '🏰' }
  ]

  const popularTravelers = [
    { name: 'Arjun Kumar', role: 'Travel Photographer', initials: 'AK' },
    { name: 'Sarah Thomas', role: 'Adventure Traveler', initials: 'ST' },
    { name: 'Rahul Mehta', role: 'Travel Creator', initials: 'RM' }
  ]

  return (
    <aside className="hidden xl:block w-80 flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto p-4 space-y-6 border-l border-slate-800">
      
      {/* Trending Destinations */}
      <div className="glass-card p-5 bg-slate-900/40 border-slate-800/80">
        <h3 className="font-semibold text-white mb-4 text-sm tracking-wider uppercase text-slate-400">Trending Destinations</h3>
        <div className="space-y-4">
          {trendingDestinations.map((dest) => (
            <div key={dest.name} className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-xl bg-slate-800/60 p-1.5 rounded-lg border border-slate-700/40 group-hover:scale-110 transition-transform">{dest.icon}</span>
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-brand-400 transition-colors">{dest.name}</h4>
                  <p className="text-xs text-slate-500">{dest.posts}</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Travelers */}
      <div className="glass-card p-5 bg-slate-900/40 border-slate-800/80">
        <h3 className="font-semibold text-white mb-4 text-sm tracking-wider uppercase text-slate-400">Popular Travelers</h3>
        <div className="space-y-4">
          {popularTravelers.map((traveler) => (
            <div key={traveler.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300 border border-slate-700/60">
                  {traveler.initials}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white leading-tight">{traveler.name}</h4>
                  <p className="text-xs text-slate-500">{traveler.role}</p>
                </div>
              </div>
              
              <button 
                onClick={() => alert(`Following ${traveler.name}`)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 border border-white/20 text-white/80 hover:text-white transition"
              >
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

    </aside>
  )
}
