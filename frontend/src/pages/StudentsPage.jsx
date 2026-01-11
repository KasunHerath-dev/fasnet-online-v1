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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 md:p-8 shadow-2xl">
          {/* Decorative elements - hidden on mobile */}
          <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="hidden md:block absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <span className="text-2xl md:text-3xl">👥</span>
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-4xl font-black text-white mb-1">Students</h1>
                    <p className="text-xs md:text-base text-indigo-100 font-medium">Manage your student records with ease</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {selectedIds.length > 0 && (
                  <>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete ({selectedIds.length})
                    </button>
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 px-5 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <Download className="w-5 h-5" />
                      Export
                    </button>
                  </>
                )}
                <a
                  href="/students/new"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Student
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & View Controls */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100">
          {/* Filter Header */}
          <div className="bg-gradient-to-r from-gray-50 to-indigo-50/50 px-4 md:px-6 py-3 md:py-4 border-b-2 border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base md:text-lg">Filters & Search</h3>
                  <p className="text-xs md:text-sm text-gray-500">Refine your student list</p>
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700 text-sm"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
            </div>
          </div>

          {/* Filter Content */}
          {showFilters && (
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative z-30">
                {/* Search */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Search Students
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-medium text-gray-900 placeholder-gray-400"
                      placeholder="Search by name, registration number..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
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
                    />
                  </div>
                </div>

                {/* Batch Year */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Batch Year
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-medium text-gray-900 placeholder-gray-400"
                    placeholder="e.g. 2024"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                  />
                </div>
              </div>

              {/* Active Filters & Clear */}
              {hasActiveFilters && (
                <div className="mt-6 pt-6 border-t-2 border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-gray-700">Active Filters:</span>
                      {query && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold">
                          Search: "{query}"
                          <button onClick={() => setQuery('')} className="hover:bg-indigo-200 rounded p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {district && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                          District: {district}
                          <button onClick={() => setDistrict('')} className="hover:bg-blue-200 rounded p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {batch && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">
                          Batch: {batch}
                          <button onClick={() => setBatch('')} className="hover:bg-purple-200 rounded p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
                    >
                      <X className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>
                </div>
              )}

              {/* View Mode Toggle */}
              <div className="mt-6 pt-6 border-t-2 border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-3">View Mode</label>
                <div className="inline-flex gap-1 md:gap-2 p-1.5 md:p-2 bg-gray-100 rounded-2xl w-full sm:w-auto justify-center sm:justify-start">
                  {VIEW_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id)}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all ${viewMode === mode.id
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                        }`}
                      title={mode.label}
                    >
                      <span className="text-base md:text-lg">{mode.icon}</span>
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
        <StudentTable
          query={query}
          district={district}
          batch={batch}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          viewMode={viewMode}
        />

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleBatchDelete}
          title="Delete Students"
          message={`Are you sure you want to delete ${selectedIds.length} selected student${selectedIds.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        />
      </div >

      <style jsx>{`
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
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div >
  )
}
