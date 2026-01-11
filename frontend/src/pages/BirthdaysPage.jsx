import { useEffect, useState } from 'react'
import { studentService } from '../services/authService'
import {
  Cake,
  Calendar,
  Gift,
  PartyPopper,
  Clock,
  Filter,
  Users,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Check
} from 'lucide-react'
import Dropdown from '../components/Dropdown'

export default function BirthdaysPage() {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [days, setDays] = useState(30)
  const [viewMode, setViewMode] = useState('timeline') // timeline or list

  useEffect(() => {
    fetchBirthdays()
  }, [days])

  const fetchBirthdays = async () => {
    try {
      setLoading(true)
      const res = await studentService.getUpcomingBirthdays(days)
      setStudents(res.data.students)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Group students by date
  const groupedByDate = students.reduce((groups, student) => {
    const date = new Date(student.nextBirthday).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(student)
    return groups
  }, {})

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(a) - new Date(b))

  const getDaysUntil = (date) => {
    return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
  }

  const getMonthName = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long' })
  }

  const getDateDay = (date) => {
    return new Date(date).getDate()
  }

  const isToday = (date) => {
    const today = new Date()
    const checkDate = new Date(date)
    return today.toDateString() === checkDate.toDateString()
  }

  const isTomorrow = (date) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const checkDate = new Date(date)
    return tomorrow.toDateString() === checkDate.toDateString()
  }

  const getDateLabel = (date) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
        {/* Enhanced Header */}
        {/* Enhanced Header */}
        <div className="relative shadow-2xl rounded-2xl md:rounded-3xl">
          {/* Background Layer with Clipping */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-2xl md:rounded-3xl overflow-hidden z-0">
            <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="hidden md:block absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          </div>

          <div className="relative z-10 p-4 md:p-8">
            <div className="flex flex-col gap-4">
              {/* Title Section */}
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Cake className="w-5 h-5 md:w-9 md:h-9 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-4xl font-black text-white mb-0.5 md:mb-1 truncate">Upcoming Birthdays</h1>
                  <p className="text-xs md:text-base text-pink-100 font-medium">Celebrate your students' special days</p>
                </div>
              </div>

              {/* Filter Controls - Stacked on Mobile */}
              <div className="flex flex-col gap-2">
                {/* View Mode Toggle */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-1 flex gap-1">
                  <button
                    onClick={() => setViewMode('timeline')}
                    className={`flex-1 px-3 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm transition-all ${viewMode === 'timeline'
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'text-white hover:bg-white/10'
                      }`}
                  >
                    Timeline
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-3 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm transition-all ${viewMode === 'list'
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'text-white hover:bg-white/10'
                      }`}
                  >
                    List
                  </button>
                </div>

                {/* Custom Dropdown */}
                <Dropdown
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  options={[
                    { value: 7, label: 'Next 7 days' },
                    { value: 30, label: 'Next 30 days' },
                    { value: 60, label: 'Next 60 days' },
                    { value: 90, label: 'Next 90 days' }
                  ]}
                  variant="glass"
                  className="w-48"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
          <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg border-2 border-pink-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <PartyPopper className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-gray-500 text-xs md:text-sm font-medium">Total Birthdays</p>
                <p className="text-xl md:text-3xl font-black text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg border-2 border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Calendar className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-gray-500 text-xs md:text-sm font-medium">Time Range</p>
                <p className="text-xl md:text-3xl font-black text-gray-900">{days} Days</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg border-2 border-indigo-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Sparkles className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-gray-500 text-xs md:text-sm font-medium">This Week</p>
                <p className="text-xl md:text-3xl font-black text-gray-900">
                  {students.filter(s => getDaysUntil(s.nextBirthday) <= 7).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="relative w-20 h-20 mb-4">
              <div className="absolute inset-0 border-4 border-pink-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-pink-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading birthdays...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg border-2 border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cake className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Upcoming Birthdays</h3>
            <p className="text-gray-600">No birthdays found in the next {days} days</p>
          </div>
        ) : viewMode === 'timeline' ? (
          /* Timeline View */
          <div className="space-y-6">
            {sortedDates.map((date, index) => {
              const daysUntil = getDaysUntil(date)
              const studentsOnDate = groupedByDate[date]

              return (
                <div key={date} className="relative" style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both` }}>
                  {/* Date Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-lg ${isToday(date)
                        ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white'
                        : 'bg-white border-2 border-gray-200 text-gray-900'
                        }`}>
                        <span className="text-xs font-bold uppercase">
                          {getMonthName(date).substring(0, 3)}
                        </span>
                        <span className="text-2xl font-black">{getDateDay(date)}</span>
                      </div>
                      {isToday(date) && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-yellow-900" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h2 className="text-2xl font-black text-gray-900">{getDateLabel(date)}</h2>
                      <p className="text-gray-600 font-medium">
                        {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`} • {studentsOnDate.length} {studentsOnDate.length === 1 ? 'birthday' : 'birthdays'}
                      </p>
                    </div>
                  </div>

                  {/* Students Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:ml-24">
                    {studentsOnDate.map((student) => (
                      <div
                        key={student._id}
                        className="group relative bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-100 hover:border-pink-300 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="absolute top-3 right-3">
                          <Gift className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {student.fullName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 mb-1 truncate group-hover:text-pink-600 transition-colors">
                              {student.fullName}
                            </h3>
                            <p className="text-xs text-gray-500 mb-2">
                              Reg: {student.registrationNumber}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full font-semibold">
                                🎂 {new Date(student.birthday).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                    <th className="px-2 md:px-6 py-2 md:py-4 text-left font-bold text-xs md:text-sm">Student</th>
                    <th className="hidden md:table-cell px-2 md:px-6 py-2 md:py-4 text-left font-bold text-xs md:text-sm">Registration #</th>
                    <th className="px-2 md:px-6 py-2 md:py-4 text-left font-bold text-xs md:text-sm">Birthday</th>
                    <th className="px-2 md:px-6 py-2 md:py-4 text-left font-bold text-xs md:text-sm">Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student, index) => {
                    const daysUntil = getDaysUntil(student.nextBirthday)
                    return (
                      <tr
                        key={student._id}
                        className="hover:bg-pink-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedStudent(student)}
                        style={{ animation: `fadeIn 0.3s ease-out ${index * 0.05}s both` }}
                      >
                        <td className="px-2 md:px-6 py-2 md:py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-xs md:text-base shadow-md flex-shrink-0">
                              {student.fullName.charAt(0)}
                            </div>
                            <span className="font-semibold text-gray-900 text-xs md:text-base truncate max-w-[120px] md:max-w-none">{student.fullName}</span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-2 md:px-6 py-2 md:py-4">
                          <span className="text-gray-700 text-xs md:text-base">{student.registrationNumber}</span>
                        </td>
                        <td className="px-2 md:px-6 py-2 md:py-4">
                          <span className="inline-flex items-center gap-1 px-1.5 md:px-3 py-0.5 md:py-1 bg-pink-100 text-pink-700 rounded-lg font-semibold text-xs whitespace-nowrap">
                            <Cake className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                            <span className="hidden md:inline">{new Date(student.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                            <span className="md:hidden">{new Date(student.birthday).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </span>
                        </td>
                        <td className="px-2 md:px-6 py-2 md:py-4">
                          <span className={`inline-flex items-center gap-1 px-1.5 md:px-3 py-0.5 md:py-1 rounded-lg font-bold text-xs whitespace-nowrap ${daysUntil === 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : daysUntil <= 7
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                            }`}>
                            <Clock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                            <span className="hidden md:inline">{daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}</span>
                            <span className="md:hidden">{daysUntil === 0 ? 'Today' : daysUntil === 1 ? '1d' : `${daysUntil}d`}</span>
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Birthday Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedStudent(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scaleIn"
            onClick={e => e.stopPropagation()}
          >
            {/* Header with Avatar */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold text-3xl shadow-lg mb-3 border-4 border-white/30">
                {selectedStudent.fullName.charAt(0)}
              </div>
              <h3 className="text-white font-bold text-lg text-center leading-tight">
                {selectedStudent.fullName}
              </h3>
              <p className="text-pink-100 text-sm font-medium mt-1">
                Reg: {selectedStudent.registrationNumber}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">

              {/* Birthday */}
              <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl border border-pink-100">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Cake className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Birthday</p>
                  <p className="font-bold text-gray-900">
                    {new Date(selectedStudent.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Whatsapp */}
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-green-600"
                  >
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0 .5-.5l.14-.3A7.7 7.7 0 0 0 6.6 7H7a.5.5 0 0 0 .5-.5V6a.5.5 0 0 0-.5-.5H6a.5.5 0 0 0-.5.5v.5e.5a.5.5 0 0 0 .5.5H7z" opacity="0" />
                    {/* Using simple phone icon fallback if needed, but lets try to mimic whatsapp icon visually or just use phone */}
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">WhatsApp / Phone</p>
                  <p className="font-bold text-gray-900 font-mono">
                    {selectedStudent.whatsapp || selectedStudent.contactNumber || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Index Number (Registration) */}
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Index Number</p>
                  <p className="font-bold text-gray-900">
                    {selectedStudent.registrationNumber}
                  </p>
                </div>
              </div>

            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-full py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Birthday Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedStudent(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scaleIn"
            onClick={e => e.stopPropagation()}
          >
            {/* Header with Avatar */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold text-3xl shadow-lg mb-3 border-4 border-white/30">
                {selectedStudent.fullName.charAt(0)}
              </div>
              <h3 className="text-white font-bold text-lg text-center leading-tight">
                {selectedStudent.fullName}
              </h3>
              <p className="text-pink-100 text-sm font-medium mt-1">
                Reg: {selectedStudent.registrationNumber}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">

              {/* Birthday */}
              <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl border border-pink-100">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Cake className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Birthday</p>
                  <p className="font-bold text-gray-900">
                    {new Date(selectedStudent.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Whatsapp */}
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-green-600"
                  >
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0 .5-.5l.14-.3A7.7 7.7 0 0 0 6.6 7H7a.5.5 0 0 0 .5-.5V6a.5.5 0 0 0-.5-.5H6a.5.5 0 0 0-.5.5v.5e.5a.5.5 0 0 0 .5.5H7z" opacity="0" />
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">WhatsApp / Phone</p>
                  <p className="font-bold text-gray-900 font-mono">
                    {selectedStudent.whatsapp || selectedStudent.contactNumber || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Index Number (Registration) */}
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Index Number</p>
                  <p className="font-bold text-gray-900">
                    {selectedStudent.registrationNumber}
                  </p>
                </div>
              </div>

            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-full py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

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
