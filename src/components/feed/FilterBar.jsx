export default function FilterBar({ activeFilter, setActiveFilter }) {
  const filters = ['All', 'Beaches', 'Mountains', 'Cities', 'Nature', 'Heritage']

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => setActiveFilter(filter)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
            activeFilter === filter
              ? 'bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/20'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  )
}
