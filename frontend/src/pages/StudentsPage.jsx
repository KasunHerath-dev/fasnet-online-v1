import { useEffect, useState } from 'react'
import { studentService } from '../services/authService'
import StatCard from '../components/StatCard'
import Dropdown from '../components/Dropdown'
import StudentTable from '../components/StudentTable'
import api from '../services/api'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { Search, Filter, Download, Trash2, UserPlus, X, SlidersHorizontal, Sparkles, Zap } from 'lucide-react'

const SRI_LANKAN_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
]

const VIEW_MODES = [
  { id: 'card', label: 'Cards', icon: '▦' },
  { id: 'grid', label: 'Grid', icon: '⊞' },
]

export default function StudentsPage() {
  const [query, setQuery] = useState('')
  const [district, setDistrict] = useState('')
  const [batch, setBatch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [viewMode, setViewMode] = useState('card')
  const [showFilters, setShowFilters] = useState(true)

  const handleBatchDelete = async () => {
    if (!selectedIds.length) return
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/students/${id}`)))
      setSelectedIds([])
      window.location.reload()
    } catch (err) {
      alert('Failed to delete some students')
    }
  }

  const handleExport = () => {
    alert('Export functionality coming soon!')
  }

  const clearFilters = () => {
    setQuery('')
    setDistrict('')
    setBatch('')
  }

  const hasActiveFilters = query || district || batch

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-display text-slate-900 dark:text-white pb-20 transition-colors duration-300">
      <div className="relative flex flex-col w-full min-h-screen">

        {/* Enhanced Hero Section - Command Center Style */}
        <div className="relative w-full h-[200px] md:h-[260px] lg:h-[300px] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-900 overflow-hidden rounded-b-[2rem] md:rounded-b-[3rem] shadow-2xl shadow-indigo-900/30 z-10">
          {/* Animated Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] pointer-events-none"></div>

          {/* Floating Orbs for Depth - Command Center Style */}
          <div className="absolute top-10 right-10 w-48 h-48 bg-purple-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-blue-400/25 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-cyan-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>

          <div className="relative flex flex-col justify-between h-full px-4 md:px-8 py-5 md:py-8 z-10 max-w-7xl mx-auto w-full">
            {/* Top Section - Status Badges */}
            <div className="flex justify-end">
              <div className="flex gap-2">
                {selectedIds.length > 0 && (
                  <span className="inline-flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/30 text-white text-xs md:text-sm font-bold shadow-xl shadow-blue-900/20">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                    {selectedIds.length} Selected
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Section - Title & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="relative group">
                  {/* Enhanced Logo with Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-cyan-300 opacity-30 rounded-2xl md:rounded-3xl blur-lg group-hover:blur-xl transition-all"></div>
                  <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl flex items-center justify-center border-2 border-white/30 shadow-2xl shadow-indigo-900/30 group-hover:scale-105 group-hover:rotate-3 transition-all">
                    <span className="text-2xl md:text-4xl">👥</span>
                  </div>
                  {/* Sparkle Indicator */}
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse drop-shadow-lg" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight drop-shadow-2xl truncate">Students</h1>
                  <p className="text-white/95 text-sm md:text-base lg:text-lg font-semibold mt-1 truncate hidden sm:flex items-center gap-2 drop-shadow-lg">
                    <Zap className="w-4 h-4" />
                    Manage your student records with ease
                  </p>
                </div>
              </div>

              {/* Enhanced Action Buttons with Gradients */}
              <div className="flex flex-wrap gap-2 md:gap-3">
                {selectedIds.length > 0 && (
                  <>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="group min-h-[44px] flex items-center gap-2 px-3 md:px-5 py-2.5 md:py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl md:rounded-2xl text-xs md:text-sm font-bold shadow-xl shadow-red-500/30 hover:shadow-2xl hover:shadow-red-500/50 transition-all hover:-translate-y-0.5 hover:scale-105 active:scale-95 border border-white/20"
                    >
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline">Delete ({selectedIds.length})</span>
                      <span className="sm:hidden">Del ({selectedIds.length})</span>
                    </button>
                    <button
                      onClick={handleExport}
                      className="group min-h-[44px] flex items-center gap-2 px-3 md:px-5 py-2.5 md:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl md:rounded-2xl text-xs md:text-sm font-bold shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all hover:-translate-y-0.5 hover:scale-105 active:scale-95 border border-white/20"
                    >
                      <Download className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline">Export</span>
                      <span className="sm:hidden">Exp</span>
                    </button>
                  </>
                )}
                <a
                  href="/students/new"
                  className="group min-h-[44px] flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white/95 hover:bg-white text-indigo-700 hover:text-indigo-900 rounded-xl md:rounded-2xl text-xs md:text-sm font-black shadow-xl shadow-white/30 hover:shadow-2xl transition-all hover:-translate-y-0.5 hover:scale-105 active:scale-95 border-2 border-white/50"
                >
                  <UserPlus className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Add Student</span>
                  <span className="sm:hidden">Add</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 z-20 -mt-8 md:-mt-10 space-y-5 md:space-y-8">

          {/* Enhanced Filters Card - Glassmorphism */}
          <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>

            {/* Filter Header with Gradient Accent */}
            <div className="relative bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/90 px-5 md:px-8 py-4 md:py-5 border-b border-slate-200/50 dark:border-slate-700/50">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5"></div>
              <div className="relative flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                    <SlidersHorizontal className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl md:rounded-2xl blur-md opacity-50"></div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-900 dark:text-white text-base md:text-xl truncate">Filters & Search</h3>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-semibold hidden sm:block truncate">Refine your student list</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="min-h-[44px] flex items-center gap-2 px-4 md:px-5 py-2.5 text-xs md:text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl transition-all font-bold text-slate-700 dark:text-slate-300 hover:scale-105 active:scale-95 shadow-lg"
                >
                  {showFilters ? 'Hide' : 'Show'} Filters
                </button>
              </div>
            </div>

            {/* Filter Content */}
            {showFilters && (
              <div className="relative p-5 md:p-8 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative z-30">
                  {/* Search with Gradient Focus */}
                  <div className="lg:col-span-2">
                    <label className="block text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Search Students
                    </label>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors z-10" />
                      <input
                        type="text"
                        className="w-full pl-12 pr-4 py-3.5 md:py-4 text-sm md:text-base bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400 shadow-inner"
                        placeholder="Search by name, registration number..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* District Dropdown */}
                  <div className="relative">
                    <label className="block text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      District
                    </label>
                    <div className="relative">
                      <Dropdown
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        options={[
                          { value: '', label: 'All Districts' },
                          ...SRI_LANKAN_DISTRICTS
                        ]}
                        icon={<Filter className="w-5 h-5" />}
                        placeholder="All Districts"
                        variant="default"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl focus:border-indigo-500 px-4 py-3.5 md:py-4 text-sm md:text-base shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Batch Year */}
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Batch Year
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3.5 md:py-4 text-sm md:text-base bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400 shadow-inner"
                      placeholder="e.g. 2024"
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Active Filters with Gradient Tags */}
                {hasActiveFilters && (
                  <div className="mt-6 pt-6 border-t-2 border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Active Filters:</span>
                        {query && (
                          <span className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-bold border-2 border-indigo-200 dark:border-indigo-700 shadow-lg shadow-indigo-500/10">
                            Search: "{query}"
                            <button onClick={() => setQuery('')} className="hover:bg-indigo-200 dark:hover:bg-indigo-700 rounded-lg p-1 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}
                        {district && (
                          <span className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-800/40 text-blue-700 dark:text-cyan-300 rounded-xl text-sm font-bold border-2 border-blue-200 dark:border-blue-700 shadow-lg shadow-blue-500/10">
                            District: {district}
                            <button onClick={() => setDistrict('')} className="hover:bg-blue-200 dark:hover:bg-blue-700 rounded-lg p-1 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}
                        {batch && (
                          <span className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-100 dark:from-purple-900/40 dark:to-pink-800/40 text-purple-700 dark:text-purple-300 rounded-xl text-sm font-bold border-2 border-purple-200 dark:border-purple-700 shadow-lg shadow-purple-500/10">
                            Batch: {batch}
                            <button onClick={() => setBatch('')} className="hover:bg-purple-200 dark:hover:bg-purple-700 rounded-lg p-1 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}
                      </div>
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg border-2 border-slate-200 dark:border-slate-700"
                      >
                        <X className="w-4 h-4" />
                        Clear All
                      </button>
                    </div>
                  </div>
                )}

                {/* View Mode Toggle with Gradient */}
                <div className="mt-6 pt-6 border-t-2 border-slate-100 dark:border-slate-800">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">View Mode</label>
                  <div className="inline-flex gap-2 p-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl w-full sm:w-auto justify-center sm:justify-start shadow-inner border-2 border-slate-200 dark:border-slate-700">
                    {VIEW_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setViewMode(mode.id)}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === mode.id
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/50 scale-105'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-600 hover:scale-105'
                          }`}
                        title={mode.label}
                      >
                        <span className="text-lg">{mode.icon}</span>
                        <span className="hidden sm:inline">{mode.label}</span>
                        <span className="sm:hidden">{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Students Display */}
          <div className="animate-fadeIn">
            <StudentTable
              query={query}
              district={district}
              batch={batch}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              viewMode={viewMode}
            />
          </div>

          <DeleteConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleBatchDelete}
            title="Delete Students"
            message={`Are you sure you want to delete ${selectedIds.length} selected student${selectedIds.length !== 1 ? 's' : ''}? This action cannot be undone.`}
          />
        </div>
      </div>

      <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out;
                }
            `}</style>
    </div>
  )
}
