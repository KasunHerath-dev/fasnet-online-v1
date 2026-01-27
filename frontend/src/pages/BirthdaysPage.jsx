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
    <div className="min-h-screen bg-slate-50 dark:bg-black font-display text-slate-900 dark:text-white transition-colors duration-300">

      {/* Enhanced Hero Section - Command Center Style */}
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
                <Cake className="w-4 h-4 text-pink-300" />
                <span className="text-white text-xs font-bold tracking-wide uppercase">Celebrations</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight">
                  Student
                  <span className="block mt-1 text-slate-500">
                    Birthdays
                  </span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-white/85 font-medium max-w-xl leading-relaxed">
                  Track upcoming birthdays and manage celebration events.
                </p>
              </div>
            </div>

            {/* Right side - Quick stats badges (Desktop) */}
            <div className="pt-2 lg:pt-0 lg:mb-1">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <Calendar className="w-4 h-4 text-white" />
                  <span className="text-white text-xs sm:text-sm font-bold">Next {days} Days</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                  </span>
                  <span className="text-white text-xs sm:text-sm font-bold">{students.length} Upcoming</span>
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
          <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">

              {/* View Mode Toggle */}
              <div className="bg-slate-100 dark:bg-black/40 rounded-xl p-1 flex">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${viewMode === 'list'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <Filter className="w-4 h-4" />
                  List View
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${viewMode === 'timeline'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <Clock className="w-4 h-4" />
                  Timeline
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Mobile Scroll / Desktop Grid */}
        <div className="flex overflow-x-auto pb-6 sm:pb-0 sm:grid sm:grid-cols-3 gap-4 sm:gap-6 snap-x snap-mandatory px-4 sm:px-0 -mx-4 sm:mx-0 scrollbar-hide">
          <div className="min-w-[85%] sm:min-w-0 snap-center pl-4 sm:pl-0 first:pl-4 last:pr-4 sm:first:pl-0 sm:last:pr-0">
            <StatCard
              icon={<PartyPopper className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 dark:text-white" />}
              label="Total Birthdays"
              value={students.length}
              subtext={`In the next ${days} days`}
            />
          </div>
          <div className="min-w-[85%] sm:min-w-0 snap-center">
            <StatCard
              icon={<Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 dark:text-white" />}
              label="This Week"
              value={students.filter(s => getDaysUntil(s.nextBirthday) <= 7).length}
              subtext="Upcoming celebrations"
            />
          </div>
          <div className="min-w-[85%] sm:min-w-0 snap-center pr-4 sm:pr-0">
            <StatCard
              icon={<Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 dark:text-white" />}
              label="Today"
              value={students.filter(s => getDaysUntil(s.nextBirthday) === 0).length}
              subtext="Birthdays today"
            />
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-slate-500 dark:text-slate-400 text-lg">Finding celebrations...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-16 text-center shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Cake className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Upcoming Birthdays</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">There are no birthdays in the next {days} days.</p>
          </div>
        ) : viewMode === 'timeline' ? (
          /* Timeline View - Redesigned */
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 md:ml-10 space-y-12 pb-12">
            {sortedDates.map((date, index) => {
              const daysUntil = getDaysUntil(date)
              const studentsOnDate = groupedByDate[date]
              const isEventToday = isToday(date)

              return (
                <div key={date} className="relative pl-8 md:pl-12 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                  {/* Timeline Node */}
                  <div className={`absolute -left-[9px] top-8 w-5 h-5 rounded-full border-4 border-white dark:border-slate-950 shadow-sm z-10 ${isEventToday ? 'bg-slate-900 dark:bg-white scale-125' : 'bg-slate-300 dark:bg-slate-700'
                    }`}></div>

                  {/* Date Header - Responsive */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8">
                    <div className={`inline-flex items-center gap-4 p-3 sm:p-4 rounded-2xl border-2 shadow-sm ${isEventToday
                      ? 'bg-slate-900 border-slate-900 text-white shadow-slate-900/20 shadow-lg'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
                      }`}>
                      <div className="flex flex-col items-center justify-center px-2 border-r border-current/20 min-w-[3.5rem]">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-80">
                          {getMonthName(date).substring(0, 3)}
                        </span>
                        <span className="text-xl sm:text-2xl font-black">{getDateDay(date)}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                        <span className="font-bold text-base sm:text-lg whitespace-nowrap">{daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : getDateLabel(date).split(',')[0]}</span>
                        {isEventToday && (
                          <span className="flex items-center gap-1 text-xs font-bold text-yellow-500 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                            <Sparkles className="w-3 h-3 animate-pulse" />
                            <span>Party Time!</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pl-2 sm:pl-0">
                      <div className="h-px w-8 bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>
                      <span className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-wide">
                        {studentsOnDate.length} {studentsOnDate.length === 1 ? 'Celeb' : 'Celebs'}
                      </span>
                    </div>
                  </div>

                  {/* Students Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {studentsOnDate.map((student) => {
                      const ageTurning = new Date().getFullYear() - new Date(student.birthday).getFullYear() + (daysUntil === 0 ? 0 : 0); // Approx turning age
                      return (
                        <div
                          key={student._id}
                          className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-white transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
                          onClick={() => setSelectedStudent(student)}
                        >
                          {/* Decorative background blob */}
                          <div className="absolute -right-10 -top-10 w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full group-hover:scale-150 transition-transform duration-500"></div>

                          <div className="relative flex items-center gap-5">
                            <div className="relative">
                              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white font-black text-2xl shadow-inner group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-colors duration-300">
                                {student.fullName.charAt(0)}
                              </div>
                              {daysUntil <= 7 && (
                                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-700 rounded-full p-1.5">
                                  <Gift className="w-4 h-4 text-slate-900 dark:text-white" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Turning {ageTurning}
                              </p>
                              <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate group-hover:underline decoration-2 underline-offset-4 pointer-events-none">
                                {student.fullName}
                              </h3>
                              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                                {student.registrationNumber}
                              </p>
                            </div>

                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                              <ChevronDown className="-rotate-90 w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div >
        ) : (
          /* List View - Redesigned */
          <div className="space-y-4" >
            {/* Table Header Row (Simulated) */}
            < div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider pl-24" >
              <div className="col-span-4">Student Name</div>
              <div className="col-span-3">Registration</div>
              <div className="col-span-3">Birthday</div>
              <div className="col-span-2 text-right">Countdown</div>
            </div >

            {
              students.map((student, index) => {
                const daysUntil = getDaysUntil(student.nextBirthday)
                const ageTurning = new Date().getFullYear() - new Date(student.birthday).getFullYear()
                return (
                  <div
                    key={student._id}
                    className="group relative bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center"
                    onClick={() => setSelectedStudent(student)}
                  >
                    {/* Mobile: Top Right Badge */}
                    <div className="absolute top-4 right-4 sm:hidden">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-xs ring-4 ring-slate-50 dark:ring-black ${daysUntil === 0
                        ? 'bg-slate-900 text-white'
                        : daysUntil <= 7
                          ? 'bg-slate-100 text-slate-900 border border-slate-200'
                          : 'bg-slate-50 text-slate-400'
                        }`}>
                        {daysUntil === 0 ? 'Today' : `${daysUntil}d`}
                      </span>
                    </div>

                    {/* Info Section */}
                    <div className="col-span-12 sm:col-span-5 w-full flex items-center gap-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white font-black text-xl sm:text-2xl shadow-inner group-hover:scale-105 transition-transform flex-shrink-0">
                        {student.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0 pr-12 sm:pr-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight truncate">{student.fullName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                            {student.registrationNumber}
                          </span>
                          <span className="sm:hidden text-xs font-medium text-slate-400">
                            Turning {ageTurning}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-7 hidden sm:flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          <Cake className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {new Date(student.birthday).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-xs font-bold text-slate-400">Turning {ageTurning}</p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${daysUntil === 0
                          ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                          : daysUntil <= 7
                            ? 'bg-white border-2 border-slate-900 text-slate-900 dark:bg-slate-800 dark:border-white dark:text-white'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                          {daysUntil === 0 ? (
                            <>
                              <Sparkles className="w-4 h-4 animate-spin-slow" />
                              <span>Today!</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4" />
                              <span>{daysUntil} Days</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div >
        )}
      </div>

      {/* Birthday Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedStudent(null)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-scaleIn border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            {/* Header with Avatar */}
            <div className="bg-slate-900 p-8 flex flex-col items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/5"></div>

              <div className="relative z-10 w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-900 dark:text-white text-4xl font-black shadow-xl mb-4 border-4 border-white/10">
                {selectedStudent.fullName.charAt(0)}
              </div>
              <h3 className="relative z-10 text-white font-black text-xl text-center leading-tight mb-1">
                {selectedStudent.fullName}
              </h3>
              <p className="relative z-10 text-slate-400 font-bold">
                {selectedStudent.registrationNumber}
              </p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">

              {/* Birthday */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                  <Cake className="w-6 h-6 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">Birthday Date</p>
                  <p className="font-black text-slate-900 dark:text-white text-lg">
                    {new Date(selectedStudent.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-400 uppercase">Contact Info</span>
                  <span className="text-xs font-bold text-slate-300 bg-slate-900 dark:bg-slate-800 px-2 py-1 rounded">Primary</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border-2 border-slate-100 dark:border-slate-800 flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
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

            <div className="p-6 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-xl transition-colors shadow-lg shadow-slate-200/50 dark:shadow-none"
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

function StatCard({ icon, label, value, subtext }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-800 flex items-center gap-6 hover:translate-y-[-4px] transition-transform duration-300">
      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700">
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
