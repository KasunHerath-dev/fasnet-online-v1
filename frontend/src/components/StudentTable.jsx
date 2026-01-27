import { useEffect, useState } from 'react'
import { studentService } from '../services/authService'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Download, Trash2, Eye, MoreVertical, Users, Grid3x3, List, Table2, ChevronLeft, ChevronRight } from 'lucide-react'

export default function StudentTable({ query, district, batch, selectedIds = [], onSelectionChange, viewMode = 'list' }) {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  useEffect(() => {
    fetchStudents()
  }, [query, district, batch, page, sortBy, sortOrder])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await studentService.getAll({
        q: query,
        district,
        batch,
        page,
        limit: 20,
      })
      setStudents(res.data.students)
      setTotal(res.data.total)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = students.map(s => s._id)
      onSelectionChange([...new Set([...selectedIds, ...allIds])])
    } else {
      const currentIds = students.map(s => s._id)
      onSelectionChange(selectedIds.filter(id => !currentIds.includes(id)))
    }
  }

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  const isAllSelected = students.length > 0 && students.every(s => selectedIds.includes(s._id))

  const getGenderIcon = (gender) => {
    const g = (gender || '').toLowerCase()
    if (g === 'male' || g === 'm') return '👨'
    if (g === 'female' || g === 'f') return '👩'
    return '👤'
  }

  const getGenderColor = (gender) => {
    const g = (gender || '').toLowerCase()
    if (g === 'male' || g === 'm') return 'bg-blue-500'
    if (g === 'female' || g === 'f') return 'bg-pink-500'
    return 'bg-slate-500'
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const handleViewStudent = (regNum) => {
    navigate(`/students/${regNum}`)
  }

  // Enhanced List View (Ash Theme)
  const ListView = () => (
    <div className="space-y-4">
      {students.map((student, index) => (
        <div
          key={student._id}
          className={`group relative bg-white dark:bg-slate-900 rounded-[2rem] border transition-all duration-300 ${selectedIds.includes(student._id)
            ? 'border-slate-900 dark:border-white shadow-lg shadow-slate-900/10'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-lg'
            }`}
          style={{
            animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
            {/* Checkbox & Avatar Group */}
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(student._id)}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleSelectOne(student._id)
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-slate-900 focus:ring-2 focus:ring-slate-900/50 cursor-pointer transition-all bg-slate-50 dark:bg-black/20"
                />
              </div>
              <div className="flex-shrink-0">
                <div className="relative w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white font-black text-xl shadow-inner group-hover:scale-105 transition-transform">
                  {getInitials(student.fullName)}
                </div>
              </div>
            </div>

            {/* Student Info */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleViewStudent(student.registrationNumber)}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 truncate group-hover:underline decoration-2 underline-offset-4 transition-all">
                    {student.fullName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg font-bold text-xs border border-slate-200 dark:border-slate-700">
                      {student.registrationNumber}
                    </span>
                    {student.whatsapp && (
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        {student.whatsapp}
                      </span>
                    )}
                    {student.district && (
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        {student.district}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewStudent(student.registrationNumber)
                    }}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Enhanced Card View (Ash Theme)
  const CardView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {students.map((student, index) => (
        <div
          key={student._id}
          className={`group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1 ${selectedIds.includes(student._id)
            ? 'border-slate-900 dark:border-white shadow-xl shadow-slate-900/10'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-lg'
            }`}
          onClick={() => handleViewStudent(student.registrationNumber)}
          style={{
            animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
          }}
        >
          {/* Minimal Header */}
          <div className="h-24 bg-slate-50 dark:bg-slate-800/50 relative">
            <div className="absolute top-4 right-4 z-10">
              <input
                type="checkbox"
                checked={selectedIds.includes(student._id)}
                onChange={(e) => {
                  e.stopPropagation()
                  handleSelectOne(student._id)
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-slate-900 focus:ring-2 focus:ring-slate-900 cursor-pointer bg-white dark:bg-black/20"
              />
            </div>
          </div>

          {/* Avatar overlapping header */}
          <div className="relative px-6 -mt-12 mb-4">
            <div className="w-24 h-24 bg-white dark:bg-slate-900 p-2 rounded-[2rem] mx-auto">
              <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-colors duration-300 shadow-inner">
                <span className="text-3xl font-black">
                  {getInitials(student.fullName)}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-8 text-center space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:underline decoration-2 underline-offset-4 line-clamp-1 mb-1">
                {student.fullName}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {student.registrationNumber}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
                {student.batch || 'Batch N/A'}
              </span>
              {student.district && (
                <span className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
                  {student.district}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Enhanced Grid View (Compact Ash Theme)
  const GridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {students.map((student, index) => (
        <div
          key={student._id}
          onClick={() => handleViewStudent(student.registrationNumber)}
          className={`group relative p-4 rounded-2xl cursor-pointer transition-all text-center ${selectedIds.includes(student._id)
            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md'
            }`}
          style={{
            animation: `fadeInUp 0.3s ease-out ${index * 0.03}s both`
          }}
        >
          <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl ${selectedIds.includes(student._id) ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'} flex items-center justify-center text-xl font-black shadow-sm transform transition-transform group-hover:scale-110`}>
            <span className={selectedIds.includes(student._id) ? 'text-white' : 'text-slate-900 dark:text-white'}>
              {getInitials(student.fullName)}
            </span>
          </div>
          <p className={`font-bold text-sm mb-0.5 truncate ${selectedIds.includes(student._id) ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
            {student.fullName?.split(' ')[0]}
          </p>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${selectedIds.includes(student._id) ? 'text-slate-300' : 'text-slate-400'}`}>
            {student.registrationNumber}
          </p>
          <div className="absolute top-2 right-2">
            <input
              type="checkbox"
              checked={selectedIds.includes(student._id)}
              onChange={(e) => {
                e.stopPropagation()
                handleSelectOne(student._id)
              }}
              onClick={(e) => e.stopPropagation()}
              className={`w-4 h-4 rounded border-2 cursor-pointer transition-all ${selectedIds.includes(student._id)
                ? 'border-white text-slate-900 focus:ring-slate-900'
                : 'border-slate-300 dark:border-slate-600 text-slate-900 focus:ring-slate-900 bg-slate-50 dark:bg-black/20'
                }`}
            />
          </div>
        </div>
      ))}
    </div>
  )

  // Enhanced Table View (Ash Theme)
  const TableView = () => (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-5 text-left w-16">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 text-slate-900 focus:ring-2 focus:ring-slate-900 cursor-pointer bg-slate-50 dark:bg-black/20"
                />
              </th>
              <th className="px-6 py-5 text-left font-black text-slate-400 text-xs uppercase tracking-wider">Student</th>
              <th className="px-6 py-5 text-left font-black text-slate-400 text-xs uppercase tracking-wider">Registration #</th>
              <th className="px-6 py-5 text-left font-black text-slate-400 text-xs uppercase tracking-wider">Contact</th>
              <th className="px-6 py-5 text-left font-black text-slate-400 text-xs uppercase tracking-wider">Location</th>
              <th className="px-6 py-5 text-center font-black text-slate-400 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {students.map((student, index) => (
              <tr
                key={student._id}
                className={`transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selectedIds.includes(student._id) ? 'bg-slate-50 dark:bg-slate-800/80' : ''
                  }`}
                style={{
                  animation: `fadeIn 0.3s ease-out ${index * 0.03}s both`
                }}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(student._id)}
                    onChange={() => handleSelectOne(student._id)}
                    className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 text-slate-900 focus:ring-slate-900 cursor-pointer bg-slate-50 dark:bg-black/20"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white text-sm font-black shadow-sm">
                      {getInitials(student.fullName)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{student.fullName}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{student.gender || 'N/A'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-sm border border-slate-200 dark:border-slate-700">
                    <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                    {student.registrationNumber}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {student.whatsapp ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                      {student.whatsapp}
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-slate-300">No contact</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {student.district ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                      {student.district}
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-slate-300">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleViewStudent(student.registrationNumber)}
                      className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Stats Bar (Ash Theme) */}
      <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-800 opacity-20 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4"></div>

        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-slate-400 text-sm font-black uppercase tracking-widest mb-2">Total Students</p>
            <p className="text-5xl sm:text-6xl font-black tracking-tight text-white mb-2">{total.toLocaleString()}</p>
            <p className="text-slate-500 text-sm font-medium">registered in the system</p>
          </div>
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-2xl">
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white opacity-80" />
          </div>
        </div>
        {selectedIds.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-4 animate-fadeIn">
            <div className="w-10 h-10 rounded-xl bg-white text-slate-900 flex items-center justify-center font-black text-lg shadow-lg">
              {selectedIds.length}
            </div>
            <p className="text-slate-300 font-medium">
              students selected for <span className="text-white font-bold decoration-slate-500 underline underline-offset-4">batch action</span>
            </p>
          </div>
        )}
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 md:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-slate-900 dark:border-white rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-6 text-slate-900 dark:text-white font-black uppercase tracking-widest text-sm">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">No students found</p>
              <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              {viewMode === 'list' && <ListView />}
              {viewMode === 'card' && <CardView />}
              {viewMode === 'grid' && <GridView />}
              {viewMode === 'table' && <TableView />}

              {/* Enhanced Pagination */}
              <div className="mt-10 pt-6 border-t border-slate-100 dark:border-white/5">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Showing <span className="font-bold text-slate-900 dark:text-white">{students.length}</span> of{' '}
                    <span className="font-bold text-slate-900 dark:text-white">{total}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-slate-900 dark:text-white hover:border-slate-900 dark:hover:border-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <div className="px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black shadow-lg shadow-slate-900/20">
                      Page {page}
                    </div>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={students.length < 20}
                      className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-slate-900 dark:text-white hover:border-slate-900 dark:hover:border-white"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
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
    </div>
  )
}
