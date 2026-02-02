import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import { Bell, Search, Menu, User, ChevronDown, LogOut, Settings, MessageCircle, Sun, Moon } from 'lucide-react'

export default function TopNav({ user, onLogout, onToggleSidebar }) {
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = user || authService.getUser()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Theme Toggle State
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return true
  })

  const userMenuRef = useRef(null)
  const notifRef = useRef(null)

  const firstName = currentUser?.studentRef?.firstName || currentUser?.username || 'User'
  const lastName = currentUser?.studentRef?.lastName || ''
  const initials = `${firstName.charAt(0)}${lastName.charAt(0) || firstName.charAt(1) || ''}`.toUpperCase()

  // Apply Theme Effect
  useEffect(() => {
    const root = window.document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

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
      <div className="bg-surface-glass backdrop-blur-xl rounded-[2rem] shadow-lg border border-border-glass px-6 py-3 transition-all duration-300">
        <div className="flex items-center gap-6">

          {/* Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 hover:bg-highlight rounded-xl transition-colors text-text-main"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Page Title */}
          <div className="hidden md:block">
            <h1 className="text-xl font-black text-text-main tracking-tight">
              {getPageTitle()}
            </h1>
          </div>


          {/* Search Bar - Liquid Style */}
          <div className="flex-1 max-w-2xl mx-auto hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="What assignment are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-highlight/50 hover:bg-highlight focus:bg-surface border border-transparent focus:border-primary/30 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-bold text-text-main outline-none transition-all placeholder:text-text-muted shadow-inner"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 ml-auto">

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="w-10 h-10 bg-highlight/50 hover:bg-highlight rounded-xl flex items-center justify-center transition-all border border-transparent hover:border-border-glass text-text-muted hover:text-primary"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 bg-highlight/50 hover:bg-highlight rounded-xl flex items-center justify-center transition-all border border-transparent hover:border-border-glass text-text-muted hover:text-text-main"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-surface"></span>
                )}
              </button>

              {/* Notification Dropdown (Glass) */}
              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 bg-surface-glass backdrop-blur-2xl border border-border-glass rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="p-4 border-b border-border-glass">
                    <h3 className="font-black text-sm text-text-main">Notifications</h3>
                  </div>
                  {/* ... Notifications List ... */}
                  {notifications.map(n => (
                    <div key={n.id} className="p-4 border-b border-border-glass hover:bg-highlight/30 transition-colors cursor-pointer">
                      <div className="flex justify-between mb-1">
                        <span className={`text-xs font-bold ${n.unread ? 'text-text-main' : 'text-text-muted'}`}>{n.title}</span>
                        <span className="text-[10px] text-text-muted">{n.time}</span>
                      </div>
                      <p className="text-xs text-text-muted">{n.message}</p>
                    </div>
                  ))}
                  <div className="p-3 text-center border-t border-border-glass">
                    <button className="text-xs font-bold text-primary hover:text-primary-glow transition-colors">Mark all reading</button>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <button
              onClick={() => navigate('/messages')}
              className="w-10 h-10 bg-highlight/50 hover:bg-highlight rounded-xl flex items-center justify-center transition-all border border-transparent hover:border-border-glass text-text-muted hover:text-text-main"
            >
              <MessageCircle className="w-5 h-5" />
            </button>

            {/* User Profile */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 bg-highlight/50 hover:bg-highlight rounded-xl pl-1 pr-3 py-1 transition-all border border-transparent hover:border-border-glass"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-rose-800 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-white font-black text-xs">{initials}</span>
                </div>
                <ChevronDown className={`w-3 h-3 text-text-muted transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* User Menu Dropdown (Glass) */}
              {showUserMenu && (
                <div className="absolute right-0 mt-4 w-60 bg-surface-glass backdrop-blur-2xl border border-border-glass rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="p-4 border-b border-border-glass">
                    <p className="font-bold text-text-main truncate">{firstName} {lastName}</p>
                    <p className="text-xs text-text-muted truncate">{currentUser?.email}</p>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { navigate('/profile'); setShowUserMenu(false) }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-text-muted hover:bg-highlight transition-colors">
                      <User className="w-4 h-4" /> Profile
                    </button>
                    <button onClick={() => { navigate('/settings'); setShowUserMenu(false) }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-text-muted hover:bg-highlight transition-colors">
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-primary hover:bg-primary/10 transition-colors mt-2">
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
