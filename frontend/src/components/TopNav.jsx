import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../services/authService'
import { Bell, LogOut, Sparkles, X } from 'lucide-react'
import api from '../services/api'

export default function TopNav({ user, onLogout, onToggleSidebar }) {
  const currentUser = user || authService.getUser()
  const [showNotifications, setShowNotifications] = useState(false)
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  // Fetch pending profile requests
  useEffect(() => {
    if (currentUser?.roles?.includes('admin') || currentUser?.roles?.includes('superadmin')) {
      fetchPendingRequests()
      // Poll every 30 seconds for updates
      const interval = setInterval(fetchPendingRequests, 30000)
      return () => clearInterval(interval)
    }
  }, [currentUser])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchPendingRequests = async () => {
    try {
      setLoading(true)
      const response = await api.get('/profile-requests?status=Pending')
      setPendingRequests(response.data.data || [])
    } catch (error) {
      console.error('Error fetching pending requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const isAdmin = currentUser?.roles?.includes('admin') || currentUser?.roles?.includes('superadmin')

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 shadow-lg shadow-slate-900/5 dark:shadow-none">
      <div className="px-4 py-3 md:px-6 md:py-4">
        <div className="flex justify-between items-center">
          {/* Mobile Menu Button */}
          <button
            className="group md:hidden p-2.5 -ml-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all"
            onClick={onToggleSidebar}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Welcome Message (Desktop only) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <Sparkles className="w-5 h-5 text-slate-400 animate-pulse" />
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Welcome back,</span>
              <span className="ml-2 font-black text-slate-900 dark:text-white text-lg">
                {currentUser?.username || 'User'}
              </span>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Role Badges */}
            <div className="hidden sm:flex items-center gap-2">
              {currentUser?.roles?.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide shadow-sm
                    bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {role}
                </span>
              ))}
            </div>

            <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-800"></div>

            {/* Notification Bell (Admin only) */}
            {isAdmin && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="group relative p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {pendingRequests.length > 0 && (
                    <>
                      <span className="absolute -top-1 -right-1 w-6 h-6 bg-slate-900 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {pendingRequests.length > 9 ? '9+' : pendingRequests.length}
                      </span>
                    </>
                  )}
                </button>

                {/* Enhanced Notification Dropdown - Fixed positioning and z-index */}
                {showNotifications && (
                  <div className="fixed md:absolute right-2 md:right-0 top-16 md:top-auto md:mt-3 w-[calc(100vw-1rem)] max-w-sm md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-[999] max-h-[calc(100vh-5rem)] md:max-h-[500px] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="relative overflow-hidden px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                            <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                              <Bell className="w-4 h-4 text-slate-900 dark:text-white" />
                            </div>
                            Profile Change Requests
                          </h3>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="md:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                          {pendingRequests.length} pending approval
                        </p>
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                      {loading ? (
                        <div className="p-12 text-center">
                          <div className="inline-block w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mb-4"></div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Loading requests...</p>
                        </div>
                      ) : pendingRequests.length === 0 ? (
                        <div className="p-12 text-center">
                          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-10 h-10 text-slate-400" />
                          </div>
                          <p className="text-base text-slate-900 dark:text-white font-bold mb-1">No pending requests</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">All caught up!</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {pendingRequests.slice(0, 5).map((request) => (
                            <Link
                              key={request._id}
                              to="/profile-requests"
                              onClick={() => setShowNotifications(false)}
                              className="group block p-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/30 dark:hover:to-purple-950/30 transition-all"
                            >
                              <div className="flex items-start gap-3">
                                <div className="relative flex-shrink-0">
                                  <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-lg group-hover:scale-105 transition-transform">
                                    {request.student?.fullName?.charAt(0) || '?'}
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-slate-900" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {request.student?.fullName || 'Unknown Student'}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                                    {request.student?.registrationNumber || 'N/A'}
                                  </p>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2">
                                    {request.reason || 'Profile update request'}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-bold">
                                      {formatTimeAgo(request.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Enhanced Footer */}
                    {pendingRequests.length > 0 && (
                      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <Link
                          to="/profile-requests"
                          onClick={() => setShowNotifications(false)}
                          className="group flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-all"
                        >
                          View All Requests ({pendingRequests.length})
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Logout Button */}
            <button
              onClick={onLogout}
              className="group flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/10 text-slate-700 dark:text-slate-300 hover:text-red-600 transition-all font-bold"
            >
              <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
