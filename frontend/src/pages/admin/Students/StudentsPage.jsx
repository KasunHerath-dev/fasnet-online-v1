import { useEffect, useState } from 'react'
import { studentService } from '../../../services/authService'
import StatCard from '../../../components/StatCard'
import Dropdown from '../../../components/Dropdown'
import StudentTable from '../../../components/admin/StudentTable'
import api from '../../../services/api'
import DeleteConfirmModal from '../../../components/DeleteConfirmModal'
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0c14] font-display text-slate-900 dark:text-white transition-colors duration-500">

      {/* Hero Section - Violet/Blue Admin Theme */}
      <div className="relative w-full overflow-hidden pb-12 sm:pb-16 lg:pb-20 bg-gradient-to-br from-violet-950 via-violet-900 to-blue-900">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M60 0 L0 0 0 60' fill='none' stroke='white' stroke-opacity='.12' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E\")", backgroundSize: '60px 60px' }}></div>

        {/* Floating orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse" style={{ background: 'radial-gradient(circle, #a78bfa, transparent)', opacity: 0.15 }}></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 animate-pulse" style={{ background: 'radial-gradient(circle, #60a5fa, transparent)', opacity: 0.12, animationDelay: '1s' }}></div>

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
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                    <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Quick Actions</h3>
                    <p className="text-slate-400 text-xs sm:text-sm font-medium">Manage records securely</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <a
                    href="/students/new"
                    className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl border border-white/5 hover:border-violet-400/30 transition-all hover:translate-x-1 group/item"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover/item:opacity-90 transition-colors" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(37,99,235,0.3)' }}>
                      <UserPlus className="w-5 h-5 text-violet-300" />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-12 pb-12 sm:pb-20">

        {/* Enhanced Controls Toolbar */}
        <div className="mb-6 sm:mb-8 lg:mb-10 -mt-2 relative z-10">
          <div className="flex flex-col xl:flex-row xl:items-center gap-4 justify-between">

            {/* Search Pill */}
            <div className="flex-1 max-w-2xl">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/20 dark:bg-black/20 rounded-2xl blur-lg transition-all group-hover:bg-white/30 dark:group-hover:bg-black/30"></div>
                <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex items-center p-2 transition-all focus-within:ring-2 focus-within:ring-slate-900 dark:focus-within:ring-white">
                  <div className="pl-4 pr-3 text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-bold placeholder-slate-400 text-sm sm:text-base h-10"
                    placeholder="Search students by name, reg number..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 ml-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${showFilters
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      Filters
                    </button>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        title="Clear Filters"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* View Mode Toggle Pill */}
            <div className="flex items-center gap-4 self-end xl:self-auto">
              {/* Mobile Filter Toggle (Visible only on small screens) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-xl border border-slate-200 dark:border-slate-800 flex items-center">
                {VIEW_MODES.map((mode) => {
                  const Icon = mode.icon
                  const isActive = viewMode === mode.id
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id)}
                      className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${isActive
                        ? 'text-white shadow-lg'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      style={isActive ? { background: 'linear-gradient(135deg, #7c3aed, #2563eb)' } : {}}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{mode.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Filters Panel */}
        {showFilters && (
          <div className="mb-8 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* District Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                    <MapPin className="w-4 h-4" />
                    District
                  </label>
                  <Dropdown
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    options={[
                      { value: '', label: 'All Districts' },
                      ...SRI_LANKAN_DISTRICTS
                    ]}
                    icon={<MapPin className="w-5 h-5" />}
                    placeholder="Select District"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold"
                  />
                </div>

                {/* Batch Year */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                    <GraduationCap className="w-4 h-4" />
                    Batch Year
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 text-base bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-slate-900 dark:focus:border-white focus:ring-0 transition-all font-bold text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                    placeholder="e.g. 2026"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                  />
                </div>

                {/* Active Filters Summary */}
                <div className="flex flex-col justify-end">
                  {hasActiveFilters ? (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2">Active Filters</p>
                      <div className="flex flex-wrap gap-2">
                        {district && <span className="px-2 py-1 bg-white dark:bg-slate-700 rounded-md text-xs font-bold shadow-sm">{district}</span>}
                        {batch && <span className="px-2 py-1 bg-white dark:bg-slate-700 rounded-md text-xs font-bold shadow-sm">Batch {batch}</span>}
                        {query && <span className="px-2 py-1 bg-white dark:bg-slate-700 rounded-md text-xs font-bold shadow-sm">Search: {query}</span>}
                      </div>
                      <button onClick={clearFilters} className="mt-2 text-xs font-bold text-red-500 hover:underline">Clear All</button>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm font-bold italic opacity-50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      No active filters
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
