export default function FeedHeader({ searchQuery, setSearchQuery }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-display font-bold text-white mb-1.5">Explore the World</h1>
      <p className="text-slate-400 text-sm mb-6">Discover beautiful places shared by travelers around you.</p>
      
      {/* Search Input */}
      <div className="relative max-w-lg">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search destinations..."
          className="w-full glass-input pl-11 bg-slate-900/60 border-slate-800 focus:border-brand-500 focus:ring-brand-500/20"
        />
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  )
}
