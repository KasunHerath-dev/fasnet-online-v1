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
    return 'bg-gray-500'
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

  // Enhanced List View with better visual hierarchy
  const ListView = () => (
    <div className="space-y-3">
      {students.map((student, index) => (
        <div
          key={student._id}
          className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 ${selectedIds.includes(student._id)
            ? 'border-indigo-500'
            : 'border-gray-100 hover:border-indigo-200'
            }`}
          style={{
            animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
          }}
        >
          <div className="flex items-center gap-4 p-5">
            {/* Checkbox */}
            <div className="flex-shrink-0">
              <input
                type="checkbox"
                checked={selectedIds.includes(student._id)}
                onChange={(e) => {
                  e.stopPropagation()
                  handleSelectOne(student._id)
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-5 h-5 rounded-lg border-2 border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer transition-all"
              />
            </div>

            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className={`relative w-14 h-14 rounded-2xl ${getGenderColor(student.gender)} flex items-center justify-center text-white text-2xl shadow-lg transform transition-transform group-hover:scale-110`}>
                <span className="font-bold text-sm">{getInitials(student.fullName)}</span>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-sm">{getGenderIcon(student.gender)}</span>
                </div>
              </div>
            </div>

            {/* Student Info */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleViewStudent(student.registrationNumber)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg mb-1 truncate group-hover:text-indigo-600 transition-colors">
                    {student.fullName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-semibold">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                      {student.registrationNumber}
                    </span>
                    {student.whatsapp && (
                      <span className="inline-flex items-center gap-1.5 text-gray-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        {student.whatsapp}
                      </span>
                    )}
                    {student.district && (
                      <span className="inline-flex items-center gap-1.5 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {student.district}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewStudent(student.registrationNumber)
                  }}
                  className="flex-shrink-0 p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all hover:shadow-md group-hover:scale-110"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Hover Effect Border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl"></div>
        </div>
      ))}
    </div>
  )

  // Enhanced Card View
  const CardView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {students.map((student, index) => (
        <div
          key={student._id}
          className={`group relative bg-white rounded-3xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${selectedIds.includes(student._id)
            ? 'border-indigo-500'
            : 'border-gray-100 hover:border-indigo-200'
            }`}
          onClick={() => handleViewStudent(student.registrationNumber)}
          style={{
            animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
          }}
        >
          {/* Header with gradient */}
          <div className={`h-24 bg-gradient-to-br ${getGenderColor(student.gender).replace('bg-', 'from-')} to-purple-600 relative`}>
            <div className="absolute top-4 right-4">
              <input
                type="checkbox"
                checked={selectedIds.includes(student._id)}
                onChange={(e) => {
                  e.stopPropagation()
                  handleSelectOne(student._id)
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-5 h-5 rounded-lg border-2 border-white text-indigo-600 focus:ring-2 focus:ring-white cursor-pointer bg-white/90"
              />
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          </div>

          {/* Avatar overlapping header */}
          <div className="relative px-6 -mt-12">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center mx-auto border-4 border-white">
              <span className={`text-4xl font-bold ${getGenderColor(student.gender).replace('bg-', 'text-')}`}>
                {getInitials(student.fullName)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 pt-4 text-center">
            <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors">
              {student.fullName}
            </h3>
            <p className="text-sm font-semibold text-indigo-600 mb-4 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              {student.registrationNumber}
            </p>

            {/* Info cards */}
            <div className="space-y-2 mb-4">
              {student.whatsapp && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2.5 rounded-xl">
                  <svg className="w-4 h-4 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className="truncate">{student.whatsapp}</span>
                </div>
              )}
              {student.district && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2.5 rounded-xl">
                  <svg className="w-4 h-4 flex-shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{student.district}</span>
                </div>
              )}
            </div>

            {/* View button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleViewStudent(student.registrationNumber)
              }}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
          </div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-2xl"></div>
        </div>
      ))}
    </div>
  )

  // Enhanced Grid View (Compact)
  const GridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {students.map((student, index) => (
        <div
          key={student._id}
          onClick={() => handleViewStudent(student.registrationNumber)}
          className={`group relative p-5 rounded-2xl cursor-pointer transition-all text-center ${selectedIds.includes(student._id)
            ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-400'
            : 'bg-white border-2 border-gray-100 hover:border-indigo-200'
            }`}
          style={{
            animation: `fadeInUp 0.3s ease-out ${index * 0.03}s both`
          }}
        >
          <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl ${getGenderColor(student.gender)} flex items-center justify-center text-white text-xl font-bold shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-6`}>
            {getInitials(student.fullName)}
          </div>
          <p className="font-bold text-gray-900 text-sm mb-1 truncate group-hover:text-indigo-600 transition-colors">
            {student.fullName?.split(' ')[0]}
          </p>
          <p className="text-xs font-semibold text-indigo-600 mb-2">{student.registrationNumber}</p>
          <div className="absolute top-2 right-2">
            <input
              type="checkbox"
              checked={selectedIds.includes(student._id)}
              onChange={(e) => {
                e.stopPropagation()
                handleSelectOne(student._id)
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      ))}
    </div>
  )

  // Enhanced Table View
  const TableView = () => (
    <div className="overflow-hidden rounded-2xl border-2 border-gray-100 shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-white text-indigo-600 focus:ring-2 focus:ring-white cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 text-left font-bold">Student</th>
              <th className="px-6 py-4 text-left font-bold">Registration #</th>
              <th className="px-6 py-4 text-left font-bold">Contact</th>
              <th className="px-6 py-4 text-left font-bold">Location</th>
              <th className="px-6 py-4 text-center font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {students.map((student, index) => (
              <tr
                key={student._id}
                className={`transition-all hover:bg-indigo-50 ${selectedIds.includes(student._id) ? 'bg-indigo-50' : ''
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
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${getGenderColor(student.gender)} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                      {getInitials(student.fullName)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{student.fullName}</p>
                      <p className="text-xs text-gray-500">{getGenderIcon(student.gender)} {student.gender || 'N/A'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-semibold text-sm">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    {student.registrationNumber}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {student.whatsapp ? (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      {student.whatsapp}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No contact</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {student.district ? (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {student.district}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleViewStudent(student.registrationNumber)}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all hover:shadow-md"
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
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm font-medium mb-1">Total Students</p>
            <p className="text-4xl font-bold">{total.toLocaleString()}</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Users className="w-8 h-8" />
          </div>
        </div>
        {selectedIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm text-indigo-100">
              <span className="font-bold text-white">{selectedIds.length}</span> student{selectedIds.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-xl font-bold text-gray-900 mb-2">No students found</p>
              <p className="text-gray-500">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              {viewMode === 'list' && <ListView />}
              {viewMode === 'card' && <CardView />}
              {viewMode === 'grid' && <GridView />}
              {viewMode === 'table' && <TableView />}

              {/* Enhanced Pagination */}
              <div className="mt-8 pt-6 border-t-2 border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-bold text-gray-900">{students.length}</span> of{' '}
                    <span className="font-bold text-gray-900">{total}</span> students
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-600"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <div className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg">
                      Page {page}
                    </div>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={students.length < 20}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-600"
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

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
