import { useEffect, useState } from 'react'
import { studentService } from '../services/authService'
import StatCard from '../components/StatCard'
import Dropdown from '../components/Dropdown'
import StudentTable from '../components/StudentTable'
import api from '../services/api'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import {
  Search,
  Filter,
  Download,
  Trash2,
  UserPlus,
  X,
  SlidersHorizontal,
  Sparkles,
  Zap,
  Users,
  TrendingUp,
  Grid3x3,
  LayoutGrid,
  CheckCircle,
  AlertCircle,
  Activity,
  Calendar,
  MapPin,
  GraduationCap
} from 'lucide-react'

const SRI_LANKAN_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
]

const VIEW_MODES = [
  { id: 'card', label: 'Cards', icon: LayoutGrid },
  { id: 'grid', label: 'Grid', icon: Grid3x3 },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-display text-slate-900 dark:text-white transition-colors duration-500">

      {/* Enhanced Hero Section with Glassmorphism */}
      <div className="relative w-full overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 opacity-90 dark:opacity-80">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        </div>

        {/* Floating orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400 opacity-20 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-400 opacity-15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-10">

            {/* Left side - Title & Description */}
            <div className="flex-1 space-y-3 sm:space-y-5">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300" />
                <span className="text-white text-[10px] sm:text-xs font-bold tracking-wide">STUDENT DIRECTORY</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-none tracking-tight">
                  Student
                  <span className="block mt-1 bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                    Directory
                  </span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-white/85 font-medium max-w-xl leading-relaxed">
                  Complete student management and analytics
                </p>
              </div>

              {/* Quick stats badges */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <Users className="w-4 h-4 text-white" />
                  <span className="text-white text-xs sm:text-sm font-bold">All Students</span>
                </div>
                {selectedIds.length > 0 && (
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
                    <span className="text-white text-xs sm:text-sm font-bold">{selectedIds.length} Selected</span>
                  </div>
                )}
                {hasActiveFilters && (
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                    <Filter className="w-4 h-4 text-white" />
                    <span className="text-white text-xs sm:text-sm font-bold">Filtered</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Quick actions card */}
            <div className="lg:w-80 xl:w-96">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base sm:text-lg">Quick Actions</h3>
                    <p className="text-white/70 text-xs sm:text-sm">Manage students</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <a
                    href="/students/new"
                    className="group flex items-center gap-3 p-3 sm:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/20 hover:border-white/30 transition-all hover:scale-105"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserPlus className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">Add Student</p>
                      <p className="text-white/70 text-xs">Create new record</p>
                    </div>
                  </a>

                  {selectedIds.length > 0 && (
                    <>
                      <button
                        onClick={handleExport}
                        className="group flex items-center gap-3 p-3 sm:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/20 hover:border-white/30 transition-all hover:scale-105 w-full"
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Download className="w-5 h-5 text-emerald-300" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-white font-bold text-sm">Export</p>
                          <p className="text-white/70 text-xs">{selectedIds.length} records</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="group flex items-center gap-3 p-3 sm:p-4 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md rounded-xl sm:rounded-2xl border border-red-400/20 hover:border-red-400/30 transition-all hover:scale-105 w-full"
                      >
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Trash2 className="w-5 h-5 text-red-300" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-white font-bold text-sm">Delete</p>
                          <p className="text-white/70 text-xs">{selectedIds.length} selected</p>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 pb-12 sm:pb-20">

        {/* Enhanced Filters Section */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">

            {/* Filter Header */}
            <div className="relative bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 px-5 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 border-b border-slate-200/50 dark:border-slate-700/50">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5"></div>

              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <SlidersHorizontal className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl blur-md opacity-50"></div>
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Search & Filter</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium hidden sm:block">Find students quickly</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="self-start sm:self-auto inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl transition-all font-bold text-slate-700 dark:text-slate-300 hover:scale-105 active:scale-95 shadow-lg text-sm sm:text-base"
                >
                  <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </button>
              </div>
            </div>

            {/* Filter Content */}
            {showFilters && (
              <div className="p-5 sm:p-6 lg:p-8 animate-fadeIn">

                {/* Filter Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">

                  {/* Search Input */}
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 mb-3">
                      <Search className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
                      Search Students
                    </label>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors z-10 pointer-events-none" />
                      <input
                        type="text"
                        className="w-full pl-12 pr-4 py-3.5 sm:py-4 text-sm sm:text-base bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400 shadow-sm hover:shadow-md"
                        placeholder="Name, registration number..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* District Filter */}
                  <div>
                    <label className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 mb-3">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
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
                        icon={<MapPin className="w-5 h-5" />}
                        placeholder="All Districts"
                        variant="default"
                        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl focus:border-blue-500 px-4 py-3.5 sm:py-4 text-sm sm:text-base shadow-sm hover:shadow-md transition-shadow"
                      />
                    </div>
                  </div>

                  {/* Batch Year */}
                  <div>
                    <label className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 mb-3">
                      <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                      Batch Year
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3.5 sm:py-4 text-sm sm:text-base bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl focus:border-purple-500 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400 shadow-sm hover:shadow-md"
                      placeholder="e.g. 2024"
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
                          Active Filters:
                        </span>

                        {query && (
                          <span className="group inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 text-indigo-700 dark:text-indigo-300 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold border-2 border-indigo-200 dark:border-indigo-700 shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:scale-105 transition-all">
                            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            "{query.length > 20 ? query.substring(0, 20) + '...' : query}"
                            <button
                              onClick={() => setQuery('')}
                              className="hover:bg-indigo-200 dark:hover:bg-indigo-700 rounded-lg p-1 transition-colors"
                              aria-label="Remove search filter"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}

                        {district && (
                          <span className="group inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-800/40 text-blue-700 dark:text-cyan-300 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold border-2 border-blue-200 dark:border-blue-700 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:scale-105 transition-all">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {district}
                            <button
                              onClick={() => setDistrict('')}
                              className="hover:bg-blue-200 dark:hover:bg-blue-700 rounded-lg p-1 transition-colors"
                              aria-label="Remove district filter"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}

                        {batch && (
                          <span className="group inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/40 dark:to-pink-800/40 text-purple-700 dark:text-purple-300 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold border-2 border-purple-200 dark:border-purple-700 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:scale-105 transition-all">
                            <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Batch {batch}
                            <button
                              onClick={() => setBatch('')}
                              className="hover:bg-purple-200 dark:hover:bg-purple-700 rounded-lg p-1 transition-colors"
                              aria-label="Remove batch filter"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}
                      </div>

                      <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600 text-slate-700 dark:text-slate-300 rounded-xl sm:rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg border-2 border-slate-200 dark:border-slate-700"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        Clear All
                      </button>
                    </div>
                  </div>
                )}

                {/* View Mode Toggle */}
                <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <label className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
                      View Mode
                    </label>

                    <div className="inline-flex gap-2 p-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-inner border-2 border-slate-200 dark:border-slate-700">
                      {VIEW_MODES.map((mode) => {
                        const Icon = mode.icon
                        const isActive = viewMode === mode.id
                        return (
                          <button
                            key={mode.id}
                            onClick={() => setViewMode(mode.id)}
                            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all ${isActive
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/50 scale-105'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-600 hover:scale-105'
                              }`}
                          >
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">{mode.label}</span>
                            <span className="sm:hidden">{mode.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleBatchDelete}
          title="Delete Students"
          message={`Are you sure you want to delete ${selectedIds.length} selected student${selectedIds.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-fadeIn { 
          animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1); 
        }
      `}</style>
    </div>
  )
}