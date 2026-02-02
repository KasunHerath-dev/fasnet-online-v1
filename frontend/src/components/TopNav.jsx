import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import { Bell, Search, Menu, User, ChevronDown, LogOut, Settings, MessageCircle } from 'lucide-react'

export default function TopNav({ user, onLogout, onToggleSidebar }) {
  const navigate = useNavigate()
  const currentUser = user || authService.getUser()
  const location = useLocation()
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
      // Navigate to search results or filter content
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
    <header className="sticky top-0 z-50 bg-black border-b border-[#2a2a2a] backdrop-blur-lg bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: Mobile Menu + Logo/Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 hover:bg-[#1a1a1a] rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#f3184c] to-[#d01440] rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-lg">F</span>
              </div>
              <span className="text-white font-black text-xl hidden sm:block">fasnet</span>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What assignment are you looking for?"
                className="w-full pl-12 pr-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#f3184c] transition-colors text-sm"
              />
            </form>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Mobile Search Button */}
            <button className="md:hidden w-10 h-10 bg-[#1a1a1a] hover:bg-[#252525] rounded-xl flex items-center justify-center transition-colors">
              <Search className="w-5 h-5 text-gray-400" />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-10 h-10 bg-[#1a1a1a] hover:bg-[#252525] rounded-xl flex items-center justify-center transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-400" />
                {unreadCount > 0 && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f3184c] rounded-full"></div>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-[#2a2a2a]">
                    <h3 className="text-white font-bold">Notifications</h3>
                    {unreadCount > 0 && (
                      <p className="text-xs text-gray-500 mt-1">{unreadCount} unread</p>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`p-4 hover:bg-[#252525] transition-colors cursor-pointer border-b border-[#2a2a2a] last:border-0 ${notif.unread ? 'bg-[#1e1e1e]' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          {notif.unread && (
                            <div className="w-2 h-2 bg-[#f3184c] rounded-full mt-2 flex-shrink-0"></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-bold">{notif.title}</p>
                            <p className="text-gray-400 text-xs mt-1">{notif.message}</p>
                            <p className="text-gray-600 text-xs mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-[#2a2a2a]">
                    <button className="w-full text-center text-sm text-[#f3184c] hover:text-[#d01440] font-bold">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <button
              onClick={() => navigate('/messages')}
              className="w-10 h-10 bg-[#1a1a1a] hover:bg-[#252525] rounded-xl flex items-center justify-center transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-gray-400" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:bg-[#1a1a1a] rounded-xl px-2 py-1.5 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{initials}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 hidden sm:block transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-[#2a2a2a]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold truncate">{firstName} {lastName}</p>
                        <p className="text-gray-500 text-xs truncate">{currentUser?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2.5 text-left hover:bg-[#252525] transition-colors flex items-center gap-3"
                    >
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-white text-sm font-medium">My Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2.5 text-left hover:bg-[#252525] transition-colors flex items-center gap-3"
                    >
                      <Settings className="w-5 h-5 text-gray-400" />
                      <span className="text-white text-sm font-medium">Settings</span>
                    </Link>
                  </div>
                  <div className="border-t border-[#2a2a2a] py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left hover:bg-[#252525] transition-colors flex items-center gap-3"
                    >
                      <LogOut className="w-5 h-5 text-[#f3184c]" />
                      <span className="text-[#f3184c] text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
