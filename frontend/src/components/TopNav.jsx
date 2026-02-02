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
    <header className="sticky top-4 z-40 px-4 md:px-8">
      <div className="bg-[#121212]/80 backdrop-blur-xl rounded-[2rem] shadow-lg border border-white/5 px-6 py-3 transition-all duration-300">
        <div className="flex items-center gap-6">

          {/* Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Page Title */}
          <div className="hidden md:block">
            <h1 className="text-xl font-black text-white tracking-tight">
              {getPageTitle()}
            </h1>
          </div>


          {/* Search Bar - Liquid Style */}
          <div className="flex-1 max-w-2xl mx-auto hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-rose-500 transition-colors" />
              <input
                type="text"
                placeholder="What assignment are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 hover:bg-black/60 focus:bg-black border border-transparent focus:border-rose-500/30 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-bold text-gray-200 outline-none transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 ml-auto">

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all border border-transparent hover:border-white/10"
              >
                <Bell className="w-5 h-5 text-gray-400 group-hover:text-white" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#121212]"></span>
                )}
              </button>

              {/* Notification Dropdown (Glass) */}
              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 bg-[#121212]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="p-4 border-b border-white/5">
                    <h3 className="font-black text-sm text-white">Notifications</h3>
                  </div>
                  {/* ... (keep existing notification list logic but styling updated) ... */}
                  <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                </div>
              )}
            </div>

            {/* Messages */}
            <button
              onClick={() => navigate('/messages')}
              className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all border border-transparent hover:border-white/10"
            >
              <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </button>

            {/* User Profile */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-xl pl-1 pr-3 py-1 transition-all border border-transparent hover:border-white/10"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#E11D48] to-[#9F1239] rounded-lg flex items-center justify-center shadow-lg shadow-rose-900/20">
                  <span className="text-white font-black text-xs">{initials}</span>
                </div>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* User Menu Dropdown (Glass) */}
              {showUserMenu && (
                <div className="absolute right-0 mt-4 w-60 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="p-4 border-b border-slate-100 dark:border-white/5">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{firstName} {lastName}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { navigate('/profile'); setShowUserMenu(false) }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                      <User className="w-4 h-4" /> Profile
                    </button>
                    <button onClick={() => { navigate('/settings'); setShowUserMenu(false) }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-[#f3184c] hover:bg-[#f3184c]/10 transition-colors mt-2">
                      <LogOut className="w-4 h-4" /> Logout
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
