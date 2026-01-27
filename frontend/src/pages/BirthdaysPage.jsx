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
  Check,
  Search,
  Arrowleft
} from 'lucide-react'
import Dropdown from '../components/Dropdown'

export default function BirthdaysPage() {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [days, setDays] = useState(30)
  const [viewMode, setViewMode] = useState('list') // Default to list for better density

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-display text-slate-900 dark:text-white transition-colors duration-300">

      {/* Enhanced Hero Section - AdminPage Theme */}
      <div className="relative w-full overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-rose-600 to-purple-700">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDgiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        </div>

        {/* Floating orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 lg:w-96 lg:h-96 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 lg:w-80 lg:h-80 bg-purple-400 opacity-15 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 lg:w-64 lg:h-64 bg-rose-400 opacity-10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-10">

            {/* Left side - Title & Description */}
            <div className="flex-1 space-y-3 sm:space-y-5">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300" />
                <span className="text-white text-[10px] sm:text-xs font-bold tracking-wide">BIRTHDAY TRACKER</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-none tracking-tight">
                  Birthday
                  <span className="block mt-1 bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                    Celebrations
                  </span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-white/85 font-medium max-w-xl leading-relaxed">
                  Track and celebrate upcoming birthdays
                </p>
              </div>

              {/* Quick stats badges */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <Calendar className="w-4 h-4 text-white" />
                  <span className="text-white text-xs sm:text-sm font-bold">Next {days} Days</span>
                </div>
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <Cake className="w-4 h-4 text-white" />
                  <span className="text-white text-xs sm:text-sm font-bold">{students.length} Birthdays</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-6 lg:-mt-8 pb-12 sm:pb-16 lg:pb-20">

        {/* Filters & Controls Card */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">

              {/* View Mode Toggle */}
              <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-1 flex">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'list'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  List View
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'timeline'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  Timeline
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={<PartyPopper className="w-6 h-6 text-white" />}
            color="bg-gradient-to-br from-pink-500 to-rose-600"
            label="Total Birthdays"
            value={students.length}
            subtext={`In the next ${days} days`}
          />
          <StatCard
            icon={<Sparkles className="w-6 h-6 text-white" />}
            color="bg-gradient-to-br from-purple-500 to-indigo-600"
            label="This Week"
            value={students.filter(s => getDaysUntil(s.nextBirthday) <= 7).length}
            subtext="Upcoming celebrations"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6 text-white" />}
            color="bg-gradient-to-br from-indigo-500 to-blue-600"
            label="Today"
            value={students.filter(s => getDaysUntil(s.nextBirthday) === 0).length}
            subtext="Birthdays today"
          />
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-slate-500 dark:text-slate-400 text-lg">Finding celebrations...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white dark:bg-stitch-card-dark rounded-[2.5rem] p-16 text-center shadow-xl border border-slate-100 dark:border-white/5">
            <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Cake className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Upcoming Birthdays</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">There are no birthdays in the next {days} days.</p>
          </div>
        ) : viewMode === 'timeline' ? (
          /* Timeline View */
          <div className="space-y-8">
            {sortedDates.map((date, index) => {
              const daysUntil = getDaysUntil(date)
              const studentsOnDate = groupedByDate[date]

              return (
                <div key={date} className="relative animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                  {/* Date Header */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="relative">
                      <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-lg border-2 ${isToday(date)
                        ? 'bg-rose-500 border-rose-400 text-white'
                        : 'bg-white dark:bg-stitch-card-dark border-slate-100 dark:border-white/10 text-slate-900 dark:text-white'
                        }`}>
                        <span className="text-xs font-bold uppercase opacity-80">
                          {getMonthName(date).substring(0, 3)}
                        </span>
                        <span className="text-3xl font-black">{getDateDay(date)}</span>
                      </div>
                      {isToday(date) && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md animate-bounce">
                          <Sparkles className="w-5 h-5 text-yellow-900" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white">{getDateLabel(date)}</h2>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase ${daysUntil === 0
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                          {daysUntil === 0 ? 'Happening Now' : `${daysUntil} Days Away`}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 font-bold">•</span>
                        <span className="text-slate-500 dark:text-slate-400 font-bold">
                          {studentsOnDate.length} {studentsOnDate.length === 1 ? 'Birthday' : 'Birthdays'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Students Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pl-0 md:pl-28">
                    {studentsOnDate.map((student) => (
                      <div
                        key={student._id}
                        className="group relative bg-white dark:bg-stitch-card-dark rounded-[2rem] p-6 shadow-lg border border-slate-100 dark:border-white/5 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all hover:translate-y-[-4px] cursor-pointer"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="absolute top-4 right-4 bg-rose-50 dark:bg-rose-900/20 p-2 rounded-xl">
                          <Gift className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-rose-500/20">
                            {student.fullName.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">Reg: {student.registrationNumber}</p>
                            <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                              {student.fullName}
                            </h3>
                          </div>
                        </div>

                        <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-rose-400 to-pink-500 w-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
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
          <div className="bg-white dark:bg-stitch-card-dark rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                  <tr>
                    <th className="px-8 py-5 text-left font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student</th>
                    <th className="hidden md:table-cell px-8 py-5 text-left font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registration</th>
                    <th className="px-8 py-5 text-left font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Birthday</th>
                    <th className="px-8 py-5 text-left font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Count Down</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {students.map((student, index) => {
                    const daysUntil = getDaysUntil(student.nextBirthday)
                    return (
                      <tr
                        key={student._id}
                        className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold shadow-sm">
                              {student.fullName.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">{student.fullName}</span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-8 py-4">
                          <span className="font-medium text-slate-500 dark:text-slate-400 font-mono text-sm">{student.registrationNumber}</span>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2">
                            <Cake className="w-4 h-4 text-rose-400" />
                            <span className="font-bold text-slate-700 dark:text-slate-200">{new Date(student.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wide ${daysUntil === 0
                            ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                            : daysUntil <= 7
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                            }`}>
                            <Clock className="w-3 h-3" />
                            {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} Days`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedStudent(null)}>
          <div
            className="bg-white dark:bg-stitch-card-dark rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-scaleIn border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            {/* Header with Avatar */}
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-8 flex flex-col items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10"></div>

              <div className="relative z-10 w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-rose-600 text-4xl font-black shadow-xl mb-4 border-4 border-white/30">
                {selectedStudent.fullName.charAt(0)}
              </div>
              <h3 className="relative z-10 text-white font-black text-xl text-center leading-tight mb-1">
                {selectedStudent.fullName}
              </h3>
              <p className="relative z-10 text-pink-100 font-bold opacity-80">
                {selectedStudent.registrationNumber}
              </p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">

              {/* Birthday */}
              <div className="flex items-center gap-4 p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-500/20">
                <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center shadow-sm">
                  <Cake className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <p className="text-xs text-rose-400 dark:text-rose-300 font-bold uppercase tracking-wide">Birthday Date</p>
                  <p className="font-black text-rose-900 dark:text-rose-100 text-lg">
                    {new Date(selectedStudent.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-400 uppercase">Contact Info</span>
                  <span className="text-xs font-bold text-slate-300 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Primary</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border-2 border-slate-100 dark:border-white/5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white font-mono text-lg tracking-tight">
                      {selectedStudent.whatsapp || selectedStudent.contactNumber || 'Not provided'}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">WhatsApp / Mobile</p>
                  </div>

                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5">
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-full py-4 bg-white dark:bg-white/10 text-slate-900 dark:text-white font-black rounded-xl hover:bg-slate-100 dark:hover:bg-white/20 transition-colors shadow-lg shadow-slate-200/50 dark:shadow-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn {
            animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}

function StatCard({ icon, color, label, value, subtext }) {
  return (
    <div className="bg-white dark:bg-stitch-card-dark p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-white/5 flex items-center gap-6 hover:translate-y-[-4px] transition-transform duration-300">
      <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center shadow-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-black text-slate-900 dark:text-white my-0.5">{value}</p>
        <p className="text-xs font-bold text-slate-400 opacity-60">{subtext}</p>
      </div>
    </div>
  )
}
