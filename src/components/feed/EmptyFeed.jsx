import { Globe } from '../auth/Icons'

export default function EmptyFeed() {
  return (
    <div className="glass-card p-12 text-center flex flex-col items-center justify-center border-slate-800/80 bg-slate-900/20 max-w-xl mx-auto py-16 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-slate-850 flex items-center justify-center mb-6 border border-slate-850 shadow-inner">
        <Globe className="w-8 h-8 text-brand-400" />
      </div>
      
      <h2 className="text-xl font-bold text-white mb-2">Your journey starts here.</h2>
      
      <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
        Discover incredible destinations and share the moments that make your travels unforgettable.
      </p>
      
      <button 
        onClick={() => alert('Photo sharing is coming next!')}
        className="btn-primary max-w-xs shadow-lg shadow-brand-500/20"
      >
        Share Your First Journey
      </button>
    </div>
  )
}
