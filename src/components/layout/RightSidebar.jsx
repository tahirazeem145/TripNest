import { Globe } from '../auth/Icons'

export default function RightSidebar() {
  return (
    <aside className="hidden xl:block w-80 flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto p-4 space-y-6 border-l border-slate-800">
      
      {/* Static Welcome & Help widget */}
      <div className="glass-card p-5 bg-slate-900/40 border-slate-800/80">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-5 h-5 text-brand-400" />
          <h3 className="font-semibold text-white text-sm tracking-wider uppercase text-slate-400">Discover TripNest</h3>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          Share your travel moments, discover new destinations, and connect with fellow travelers.
        </p>
      </div>

    </aside>
  )
}
