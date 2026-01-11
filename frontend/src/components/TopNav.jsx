import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../services/authService'
import { Bell } from 'lucide-react'
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
    <header className="topnav px-4 py-3 md:px-6 md:py-4">
      <div className="flex justify-between items-center">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Welcome Message (Desktop only) */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-gray-400">Welcome back,</span>
          <span className="font-semibold text-gray-900">{currentUser?.username || 'User'}</span>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Role Badges */}
          <div className="hidden sm:flex items-center gap-2">
            {currentUser?.roles?.map((role) => (
              <span key={role} className="badge badge-primary">
                {role}
              </span>
            ))}
          </div>

          <div className="hidden sm:block h-6 w-px bg-gray-200"></div>

          {/* Notification Bell (Admin only) */}
          {isAdmin && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {pendingRequests.length > 9 ? '9+' : pendingRequests.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border-2 border-gray-100 z-50 max-h-[500px] overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h3 className="font-bold text-gray-900 text-sm">Profile Change Requests</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{pendingRequests.length} pending</p>
                  </div>

                  {/* Notifications List */}
                  <div className="overflow-y-auto flex-1">
                    {loading ? (
                      <div className="p-8 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading...</p>
                      </div>
                    ) : pendingRequests.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No pending requests</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {pendingRequests.slice(0, 5).map((request) => (
                          <Link
                            key={request._id}
                            to="/profile-requests"
                            onClick={() => setShowNotifications(false)}
                            className="block p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {request.student?.fullName?.charAt(0) || '?'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">
                                  {request.student?.fullName || 'Unknown Student'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {request.student?.registrationNumber || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {request.reason || 'Profile update request'}
                                </p>
                                <p className="text-xs text-indigo-600 mt-1 font-medium">
                                  {formatTimeAgo(request.createdAt)}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {pendingRequests.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                      <Link
                        to="/profile-requests"
                        onClick={() => setShowNotifications(false)}
                        className="block text-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        View All Requests ({pendingRequests.length})
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
