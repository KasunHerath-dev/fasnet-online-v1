import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { Bell, Search, Menu, User, ChevronDown, LogOut, Settings, MessageCircle } from 'lucide-react'

export default function TopNav({ user, onLogout, onToggleSidebar }) {
  const navigate = useNavigate()
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

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-[#2a2a2a]">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between gap-6">

          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-[#f3184c] to-[#d01440] rounded-full flex items-center justify-center">
                <span className="text-white font-black text-sm">F</span>
              </div>
              <span className="text-white font-bold text-lg">fasnet</span>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What assignment are you looking for?"
                className="w-full pl-11 pr-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#f3184c] transition-colors"
              />
            </form>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-9 h-9 bg-[#1a1a1a] hover:bg-[#252525] rounded-lg flex items-center justify-center transition-colors"
              >
                <Bell className="w-4 h-4 text-gray-400" />
                {unreadCount > 0 && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-[#f3184c] rounded-full"></div>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-[#2a2a2a]">
                    <h3 className="text-white font-bold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <p className="text-xs text-gray-500 mt-1">{unreadCount} unread</p>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`p-3 hover:bg-[#252525] transition-colors cursor-pointer border-b border-[#2a2a2a] last:border-0 ${notif.unread ? 'bg-[#1e1e1e]' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          {notif.unread && (
                            <div className="w-1.5 h-1.5 bg-[#f3184c] rounded-full mt-1.5 flex-shrink-0"></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium">{notif.title}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{notif.message}</p>
                            <p className="text-gray-600 text-xs mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-[#2a2a2a]">
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
              className="w-9 h-9 bg-[#1a1a1a] hover:bg-[#252525] rounded-lg flex items-center justify-center transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-gray-400" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:bg-[#1a1a1a] rounded-lg px-1.5 py-1 transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{initials}</span>
                </div>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-2xl overflow-hidden">
                  <div className="p-3 border-b border-[#2a2a2a]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{firstName} {lastName}</p>
                        <p className="text-gray-500 text-xs truncate">{currentUser?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-3 py-2 text-left hover:bg-[#252525] transition-colors flex items-center gap-2.5"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-white text-sm">My Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-3 py-2 text-left hover:bg-[#252525] transition-colors flex items-center gap-2.5"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span className="text-white text-sm">Settings</span>
                    </Link>
                  </div>
                  <div className="border-t border-[#2a2a2a] py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-left hover:bg-[#252525] transition-colors flex items-center gap-2.5"
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
    </header>
  )
}
