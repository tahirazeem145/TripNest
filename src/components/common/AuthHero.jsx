// Shared left-panel hero section used on Login and Register pages
export default function AuthHero({ title, subtitle }) {
  return (
    <div className="relative flex flex-col justify-between p-10 overflow-hidden">
      {/* Background gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-brand-900/60 to-slate-900" />

      {/* Decorative blurred blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-600/10 rounded-full blur-2xl" />

      {/* Content */}
      <div className="relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/40">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="font-display font-bold text-2xl text-white tracking-wide">Roamly</span>
        </div>
      </div>

      {/* Center: large tagline */}
      <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
        <h1 className="font-display text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
          {title}
        </h1>
        <p className="text-brand-200/80 text-lg leading-relaxed max-w-xs">
          {subtitle}
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 mt-8">
          {['📸 Share Moments', '🌍 Discover Destinations', '✈️ Connect Travelers'].map(f => (
            <span
              key={f}
              className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium backdrop-blur-sm"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="relative z-10">
        <p className="text-white/40 text-sm">
          © 2025 Roamly · Discover. Share. Explore.
        </p>
      </div>
    </div>
  )
}
