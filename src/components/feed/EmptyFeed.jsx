import { Globe } from '../auth/Icons'
import { useNavigate } from 'react-router-dom'

export default function EmptyFeed() {
  const navigate = useNavigate()

  return (
    <div className="glass-card p-12 text-center flex flex-col items-center justify-center border-slate-800/80 bg-slate-900/20 max-w-xl mx-auto py-16 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-slate-850 flex items-center justify-center mb-6 border border-slate-850 shadow-inner">
        <Globe className="w-8 h-8 text-brand-400" />
      </div>
      
      <h2 className="text-xl font-bold text-white mb-2">No journeys yet</h2>
      
      <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
        Travel stories from the TripNest community will appear here. Start by sharing your first journey.
      </p>
      
      <button 
        onClick={() => navigate('/create')}
        className="btn-primary max-w-xs shadow-lg shadow-brand-500/20"
      >
        Share Your First Journey
      </button>
    </div>
  )
}
