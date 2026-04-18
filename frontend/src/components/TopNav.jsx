import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import { Bell, Search, Menu, User, ChevronDown, LogOut, Settings, MessageCircle, Sun, Moon, X, Info } from 'lucide-react'
import { notificationService } from '../services/notificationService'
import { socketService } from '../services/socketService'
import FluidGlass from './FluidGlass'

export default function TopNav({ user, onLogout, onToggleSidebar }) {
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = user || authService.getUser()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNotif, setSelectedNotif] = useState(null)

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

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isFetchingNotifs, setIsFetchingNotifs] = useState(false)

  // Fetch real notifications
  const fetchNotifications = async () => {
    setIsFetchingNotifs(true)
    try {
      const res = await notificationService.getAll()
      if (res.data && res.data.success) {
        setNotifications(res.data.data)
        setUnreadCount(res.data.unreadCount)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setIsFetchingNotifs(false)
    }
  }

  useEffect(() => {
    fetchNotifications()

    // Real-time socket listener
    socketService.on('newNotification', (newNotif) => {
      setNotifications(prev => [newNotif, ...prev])
      setUnreadCount(prev => prev + 1)
      
      if (Notification.permission === 'granted') {
          new window.Notification(newNotif.title, { body: newNotif.body });
      }
    })

    return () => {
      socketService.off('newNotification')
    }
  }, [])

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  // Resolve a notification link to the correct routed path.
  // Bare paths like /profile, /settings?section=lms become /:studentId/path?query etc.
  const resolveLink = (link) => {
    if (!link) return null
    
    const isSuperAdmin = currentUser?.roles?.includes('superadmin')
    if (isSuperAdmin) return link

    // Try to get the student ID from the current URL first (most reliable)
    const pathSegments = location.pathname.split('/')
    let currentId = pathSegments[1]
    
    // Fallback if we're not on a student-prefixed page
    if (!currentId || currentId === 'admin' || currentId === 'login' || currentId === 'messages') {
      currentId = currentUser?.studentRef?.registrationNumber || currentUser?.username
    }

    if (!currentId) return link
    
    // If the link already starts with the registration number, return as is
    if (link.startsWith(`/${currentId}/`)) return link
    
    // Split path from query string before prefixing
    const [path, qs] = link.split('?')
    const bare = path.startsWith('/') ? path.slice(1) : path
    
    // Special case: if it's already a full path with an ID, don't re-prefix
    const firstSegment = bare.split('/')[0]
    if (/^[A-Z]\d+$/i.test(firstSegment)) return link

    return `/${currentId}/${bare}${qs ? `?${qs}` : ''}`
  }

  const handleNotificationClick = async (n) => {
    if (!n.isRead) await handleMarkRead(n._id)
    setShowNotifications(false)
    
    // If it has a link, try to navigate
    if (n.link && n.link !== '#' && n.link !== '') {
      const dest = resolveLink(n.link)
      if (dest) {
        navigate(dest)
        return
      }
    }
    
    // If no link or specifically requested, show as popup (Reminder)
    setSelectedNotif(n)
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all read:', err)
    }
  }

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

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      authService.logout()
      navigate('/login')
    }
  }

  const getPageTitle = () => {
    const path = location.pathname.split('/')[2] || 'dashboard'
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
                  <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div 
                          key={n._id} 
                          onClick={() => handleNotificationClick(n)}
                          className={`p-4 border-b border-border-glass hover:bg-highlight/30 transition-colors group ${n.link ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          <div className="flex justify-between mb-1">
                            <span className={`text-xs font-bold ${!n.isRead ? 'text-text-main flex items-center gap-2' : 'text-text-muted'}`}>
                              {!n.isRead && <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>}
                              {n.title}
                            </span>
                            <span className="text-[10px] text-text-muted">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted line-clamp-2">{n.body}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center bg-highlight/5">
                        <Bell className="w-8 h-8 text-text-muted/20 mx-auto mb-2" />
                        <p className="text-xs text-text-muted italic">No notifications yet</p>
                      </div>
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="p-3 text-center border-t border-border-glass">
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-xs font-bold text-primary hover:text-primary-glow transition-colors"
                      >
                        Mark all as read
                      </button>
                    </div>
                  )}
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

              {showUserMenu && (
                <div className="absolute right-0 mt-4 w-60 bg-surface-glass backdrop-blur-2xl border border-border-glass rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="p-4 border-b border-border-glass">
                    <p className="font-bold text-text-main truncate">{firstName} {lastName}</p>
                    <p className="text-xs text-text-muted truncate">{currentUser?.email}</p>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { navigate(resolveLink('/profile')); setShowUserMenu(false) }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-text-muted hover:bg-highlight transition-colors">
                      <User className="w-4 h-4" /> Profile
                    </button>
                    <button onClick={() => { navigate(resolveLink('/settings')); setShowUserMenu(false) }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-text-muted hover:bg-highlight transition-colors">
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

      {/* Notification Detail Modal (Reminder) */}
      {selectedNotif && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <FluidGlass className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/20 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-highlight/20 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-text-main" />
                </div>
                <button 
                  onClick={() => setSelectedNotif(null)}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              <h3 className="text-xl font-black text-text-main mb-2 tracking-tight">
                {selectedNotif.title || 'Notification'}
              </h3>
              
              <div className="flex items-center gap-2 text-xs text-text-muted mb-6 font-bold uppercase tracking-widest">
                <Info className="w-3.5 h-3.5" />
                {new Date(selectedNotif.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              </div>

              <div className="bg-white/5 rounded-3xl p-6 border border-white/5 mb-8">
                <p className="text-text-main/90 leading-relaxed whitespace-pre-wrap">
                  {selectedNotif.body}
                </p>
              </div>

              <div className="flex gap-3">
                {selectedNotif.link && selectedNotif.link !== '#' && (
                  <button
                    onClick={() => {
                      const dest = resolveLink(selectedNotif.link)
                      setSelectedNotif(null)
                      if (dest) navigate(dest)
                    }}
                    className="flex-1 py-4 bg-highlight text-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Take Action
                  </button>
                )}
                <button
                  onClick={() => setSelectedNotif(null)}
                  className={`py-4 px-8 font-black rounded-2xl border border-border-glass hover:bg-white/5 transition-all ${selectedNotif.link ? 'flex-shrink-0' : 'flex-1 bg-highlight text-black'}`}
                >
                  Close
                </button>
              </div>
            </div>
          </FluidGlass>
        </div>
      )}
    </header>
  )
}
