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
  const [students, setStudents] = useState([])

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const { data } = await studentService.getAllStudents()
      setStudents(data.students || [])
    } catch (error) {
      console.error('Failed to fetch students:', error)
    }
  }

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
    <div className="min-h-screen bg-slate-50 dark:bg-black font-display text-slate-900 dark:text-white transition-colors duration-500">

      {/* Enhanced Hero Section - Command Center Style */}
      <div className="relative w-full overflow-hidden pb-32 sm:pb-20 lg:pb-24">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-black">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        </div>

        {/* Floating orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-700 opacity-10 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-slate-600 opacity-5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-10">

            {/* Left side - Title & Description */}
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-lg w-fit">
                <Users className="w-4 h-4 text-slate-300" />
                <span className="text-white text-xs font-bold tracking-wide uppercase">Directory</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight">
                  Student
                  <span className="block mt-1 text-slate-500">
                    Database
                  </span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-white/85 font-medium max-w-xl leading-relaxed">
                  Manage profiles, academic records, and enrollment data.
                </p>
              </div>

              {/* Quick stats badges */}
              <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-white text-xs sm:text-sm font-bold">Live System</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <Users className="w-4 h-4 text-white" />
                  <span className="text-white text-xs sm:text-sm font-bold">{students.length} Total Students</span>
                </div>
              </div>
            </div>

            {/* Right side - Quick actions card */}
            <div className="lg:w-80 xl:w-96">
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 sm:p-6 lg:p-8 border border-white/10 shadow-2xl hover:border-white/20 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Quick Actions</h3>
                    <p className="text-slate-400 text-xs sm:text-sm font-medium">Manage records securely</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <a
                    href="/students/new"
                    className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl border border-white/5 hover:border-white/20 transition-all hover:translate-x-1 group/item"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover/item:bg-emerald-500/30 transition-colors">
                      <UserPlus className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">Add Student</p>
                      <p className="text-slate-400 text-xs">Create new record</p>
                    </div>
                  </a>

                  {selectedIds.length > 0 && (
                    <>
                      <button
                        onClick={handleExport}
                        className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl border border-white/5 hover:border-white/20 transition-all hover:translate-x-1 group/item w-full"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover/item:bg-blue-500/30 transition-colors">
                          <Download className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-white font-bold text-sm">Export Data</p>
                          <p className="text-slate-400 text-xs">CSV / Excel format</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-4 p-4 bg-red-500/10 hover:bg-red-500/20 backdrop-blur-md rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all hover:translate-x-1 group/item w-full"
                      >
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center group-hover/item:bg-red-500/30 transition-colors">
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-red-400 font-bold text-sm">Delete Records</p>
                          <p className="text-red-400/60 text-xs">Permanent action</p>
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

        {/* Enhanced Filters Section - Ash Theme */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">

            {/* Filter Header */}
            <div className="relative px-6 sm:px-8 py-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 transition-transform hover:rotate-6">
                    <SlidersHorizontal className="w-6 h-6 text-white dark:text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Search & Filter</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">Refine student list</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="self-start sm:self-auto inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </button>
              </div>
            </div>

            {/* Filter Content */}
            {showFilters && (
              <div className="p-6 sm:p-8 animate-fadeIn bg-white dark:bg-slate-900">

                {/* Filter Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                  {/* Search Input */}
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                      <Search className="w-4 h-4" />
                      Search Students
                    </label>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors z-10 pointer-events-none" />
                      <input
                        type="text"
                        className="w-full pl-12 pr-4 py-4 text-base bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-slate-900 dark:focus:border-white focus:ring-0 transition-all font-bold text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                        placeholder="Search by key details..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* District Filter */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                      <MapPin className="w-4 h-4" />
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
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-slate-900 dark:focus:border-white px-4 py-4 text-base font-bold shadow-none hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Batch Year */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                      <GraduationCap className="w-4 h-4" />
                      Batch Year
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-4 text-base bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-slate-900 dark:focus:border-white focus:ring-0 transition-all font-bold text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                      placeholder="e.g. 2024"
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-slate-400 uppercase tracking-wider mr-2">
                          Active Filters:
                        </span>

                        {query && (
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-700">
                            <Search className="w-3.5 h-3.5" />
                            "{query.length > 20 ? query.substring(0, 20) + '...' : query}"
                            <button
                              onClick={() => setQuery('')}
                              className="ml-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md p-0.5 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}

                        {district && (
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-700">
                            <MapPin className="w-3.5 h-3.5" />
                            {district}
                            <button
                              onClick={() => setDistrict('')}
                              className="ml-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md p-0.5 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}

                        {batch && (
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-700">
                            <GraduationCap className="w-3.5 h-3.5" />
                            Batch {batch}
                            <button
                              onClick={() => setBatch('')}
                              className="ml-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md p-0.5 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}
                      </div>

                      <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl font-bold transition-all active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                      </button>
                    </div>
                  </div>
                )}

                {/* View Mode Toggle - Ash Theme */}
                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      View Layout
                    </label>

                    <div className="inline-flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      {VIEW_MODES.map((mode) => {
                        const Icon = mode.icon
                        const isActive = viewMode === mode.id
                        return (
                          <button
                            key={mode.id}
                            onClick={() => setViewMode(mode.id)}
                            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${isActive
                              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }`}
                          >
                            <Icon className="w-4 h-4" />
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
      </div >

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
    </div >
  )
}