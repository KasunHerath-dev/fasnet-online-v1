import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import { Bell, Search, Menu, User, ChevronDown, LogOut, Settings, MessageCircle } from 'lucide-react'

export default function TopNav({ user, onLogout, onToggleSidebar }) {
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = user || authService.getUser()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const userMenuRef = useRef(null)
  const notifRef = useRef(null)

  const firstName = currentUser?.studentRef?.firstName || currentUser?.username || 'User'
  const lastName = currentUser?.studentRef?.lastName || ''
  const initials = `${firstName.charAt(0)}${lastName.charAt(0) || firstName.charAt(1) || ''}`.toUpperCase()

  // Mock notifications
  const notifications = [
    { id: 1, title: 'New grade published', message: 'Database Systems - A', time: '2h ago', unread: true },
    { id: 2, title: 'Assignment due soon', message: 'Web Development Project', time: '5h ago', unread: true },
    { id: 3, title: 'New study material', message: 'AI & ML - Week 5', time: '1d ago', unread: false }
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery)
    }
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      authService.logout()
      navigate('/login')
    }
  }

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1] || 'dashboard'
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')
  }

  return (
    <header className="sticky top-0 z-50 bg-gray-50 py-4">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4">

          {/* Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 hover:bg-white rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Main Container - Page Title, Search, Actions */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-6 py-3 flex items-center gap-4">

              {/* Page Title */}
              <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap hidden lg:block">
                {getPageTitle()}
              </h1>

              {/* Search Bar */}
              <div className="flex-1">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What assignment are you looking for?"
                    className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#f3184c] focus:bg-white transition-colors"
                  />
                </form>
              </div>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-700" />
                  {unreadCount > 0 && (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f3184c] rounded-full"></div>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-gray-900 font-bold text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <p className="text-xs text-gray-500 mt-1">{unreadCount} unread</p>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notif => (
                        <div
                          key={notif.id}
                          className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0 ${notif.unread ? 'bg-pink-50' : ''}`}
                        >
                          <div className="flex items-start gap-2">
                            {notif.unread && (
                              <div className="w-1.5 h-1.5 bg-[#f3184c] rounded-full mt-1.5 flex-shrink-0"></div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 text-sm font-medium">{notif.title}</p>
                              <p className="text-gray-600 text-xs mt-0.5">{notif.message}</p>
                              <p className="text-gray-400 text-xs mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t border-gray-200">
                      <button className="w-full text-center text-xs text-[#f3184c] hover:text-[#d01440] font-medium py-1">
                        View all
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages */}
              <button
                onClick={() => navigate('/messages')}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-gray-700" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{initials}</span>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                    <div className="p-3 border-b border-gray-200">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium text-sm truncate">{firstName} {lastName}</p>
                          <p className="text-gray-500 text-xs truncate">{currentUser?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2.5"
                      >
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-900 text-sm">My Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2.5"
                      >
                        <Settings className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-900 text-sm">Settings</span>
                      </Link>
                    </div>
                    <div className="border-t border-gray-200 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2.5"
                      >
                        <LogOut className="w-4 h-4 text-[#f3184c]" />
                        <span className="text-[#f3184c] text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
