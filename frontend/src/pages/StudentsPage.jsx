import { useEffect, useState } from 'react'
import { studentService } from '../services/authService'
import StatCard from '../components/StatCard'
import Dropdown from '../components/Dropdown'
import StudentTable from '../components/StudentTable'
import api from '../services/api'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { Search, Filter, Download, Trash2, UserPlus, X, SlidersHorizontal } from 'lucide-react'

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
    <div className="min-h-screen bg-stitch-bg-light dark:bg-stitch-bg-dark font-display text-slate-900 dark:text-white pb-20 transition-colors duration-300">
      <div className="relative flex flex-col w-full min-h-screen">

        {/* Hero Section - Professional Mobile-First */}
        <div className="relative w-full h-[180px] md:h-[240px] lg:h-[280px] bg-gradient-to-br from-stitch-blue via-[#6b13ec] to-stitch-pink overflow-hidden rounded-b-[1.5rem] md:rounded-b-[2.5rem] shadow-2xl z-10">
          {/* Animated Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-stitch-blue opacity-20 rounded-full translate-y-1/4 -translate-x-1/4 blur-2xl"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>

          <div className="relative flex flex-col justify-between h-full px-4 md:px-6 py-4 md:py-6 z-10 max-w-7xl mx-auto w-full">
            {/* Top Section - Quick Stats */}
            <div className="flex justify-end">
              <div className="flex gap-2">
                {selectedIds.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] md:text-xs font-bold shadow-lg">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                    {selectedIds.length} Selected
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Section - Title & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 md:gap-6">
              <div className="flex items-center gap-2.5 md:gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-white opacity-20 rounded-lg md:rounded-2xl blur-md group-hover:blur-lg transition-all"></div>
                  <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg group-hover:scale-105 transition-transform">
                    <span className="text-xl md:text-3xl">👥</span>
                  </div>
                </div>
                <div className="min-w-0">
                  <h1 className="text-white text-xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight drop-shadow-lg truncate">Students</h1>
                  <p className="text-white/90 text-xs md:text-sm lg:text-base font-semibold mt-0.5 truncate hidden sm:block drop-shadow-md">Manage your student records with ease</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {selectedIds.length > 0 && (
                  <>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="min-h-[44px] flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg md:rounded-xl text-xs md:text-sm font-bold shadow-lg hover:shadow-red-500/30 transition-all hover:-translate-y-0.5 active:scale-95"
                    >
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="hidden sm:inline">Delete ({selectedIds.length})</span>
                      <span className="sm:hidden">Del ({selectedIds.length})</span>
                    </button>
                    <button
                      onClick={handleExport}
                      className="min-h-[44px] flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg md:rounded-xl text-xs md:text-sm font-bold shadow-lg hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5 active:scale-95"
                    >
                      <Download className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="hidden sm:inline">Export</span>
                      <span className="sm:hidden">Exp</span>
                    </button>
                  </>
                )}
                <a
                  href="/students/new"
                  className="min-h-[44px] flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 bg-white text-stitch-blue hover:text-white hover:bg-white/20 hover:backdrop-blur-md border border-white/50 rounded-lg md:rounded-xl text-xs md:text-sm font-black shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Add Student</span>
                  <span className="sm:hidden">Add</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-3 md:px-6 z-20 -mt-6 md:-mt-8 space-y-4 md:space-y-8">

          {/* Filters & View Controls */}
          <div className="bg-white dark:bg-stitch-card-dark rounded-xl md:rounded-2xl shadow-xl border border-slate-100 dark:border-stitch-card-border overflow-hidden">
            {/* Filter Header */}
            <div className="bg-slate-50 dark:bg-white/5 px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 dark:border-stitch-card-border">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-stitch-blue/10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5 text-stitch-blue" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm md:text-lg truncate">Filters & Search</h3>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 hidden sm:block truncate">Refine your student list</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="min-h-[44px] flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg md:rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all font-bold text-slate-700 dark:text-slate-300 active:scale-95"
                >
                  {showFilters ? 'Hide' : 'Show'} Filters
                </button>
              </div>
            </div>

            {/* Filter Content */}
            {showFilters && (
              <div className="p-3 md:p-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 relative z-30">
                  {/* Search */}
                  <div className="lg:col-span-2">
                    <label className="block text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 md:mb-2">
                      Search Students
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                      <input
                        type="text"
                        className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg md:rounded-xl focus:bg-white dark:focus:bg-black/40 focus:border-stitch-blue focus:ring-2 md:focus:ring-4 focus:ring-stitch-blue/10 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400"
                        placeholder="Search by name, registration number..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* District */}
                  <div className="relative">
                    <label className="block text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 md:mb-2">
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
                        icon={<Filter className="w-4 h-4 md:w-5 md:h-5" />}
                        placeholder="All Districts"
                        variant="default"
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg md:rounded-xl focus:border-stitch-blue px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base"
                      />
                    </div>
                  </div>

                  {/* Batch Year */}
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 md:mb-2">
                      Batch Year
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg md:rounded-xl focus:bg-white dark:focus:bg-black/40 focus:border-stitch-blue focus:ring-2 md:focus:ring-4 focus:ring-stitch-blue/10 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400"
                      placeholder="e.g. 2024"
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Active Filters & Clear */}
                {hasActiveFilters && (
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Active Filters:</span>
                        {query && (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-bold border border-indigo-100 dark:border-indigo-800">
                            Search: "{query}"
                            <button onClick={() => setQuery('')} className="hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded p-0.5 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {district && (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-bold border border-blue-100 dark:border-blue-800">
                            District: {district}
                            <button onClick={() => setDistrict('')} className="hover:bg-blue-100 dark:hover:bg-blue-800 rounded p-0.5 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {batch && (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-bold border border-purple-100 dark:border-purple-800">
                            Batch: {batch}
                            <button onClick={() => setBatch('')} className="hover:bg-purple-100 dark:hover:bg-purple-800 rounded p-0.5 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                      </div>
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all active:scale-95"
                      >
                        <X className="w-4 h-4" />
                        Clear All
                      </button>
                    </div>
                  </div>
                )}

                {/* View Mode Toggle */}
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">View Mode</label>
                  <div className="inline-flex gap-2 p-2 bg-slate-100 dark:bg-black/20 rounded-2xl w-full sm:w-auto justify-center sm:justify-start">
                    {VIEW_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setViewMode(mode.id)}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === mode.id
                          ? 'bg-stitch-blue text-white shadow-lg scale-105'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10'
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

      <style sx>{`
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
