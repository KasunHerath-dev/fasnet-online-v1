import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import { Bell, Search, Menu, User, ChevronDown, LogOut, Settings, MessageCircle, Sparkles } from 'lucide-react'

export default function TopNav({ user, onLogout, onToggleSidebar }) {
  const currentUser = user || authService.getUser()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const userMenuRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1] || 'dashboard'
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  return (
    <header
      className={`
        sticky top-0 z-40 transition-all duration-300
        ${scrolled
          ? 'bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-xl border-b border-gray-100 dark:border-[#303030] shadow-lg shadow-black/5'
          : 'bg-transparent'
        }
      `}
    >
      <div className="px-3 sm:px-4 md:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-6">

          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 sm:p-2.5 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-xl transition-all active:scale-95"
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            <div className="hidden md:block">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                {getPageTitle()}
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#f3184c]" />
              </h1>
            </div>
          </div>

          {/* Center: Premium Search Bar */}
          <div className="flex-1 max-w-2xl hidden sm:block">
            <div className={`
              relative group transition-all duration-300
              ${searchFocused ? 'scale-105' : ''}
            `}>
              <Search className={`
                absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-300
                ${searchFocused ? 'text-[#f3184c] scale-110' : 'text-gray-400'}
              `} />
              <input
                type="text"
                placeholder="Search anything..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`
                  w-full bg-gray-100 dark:bg-[#303030] border-2 rounded-2xl py-2.5 sm:py-3.5 pl-10 sm:pl-11 pr-4 
                  text-sm font-medium placeholder:text-gray-400 dark:text-white
                  transition-all duration-300
                  ${searchFocused
                    ? 'border-[#f3184c] bg-white dark:bg-[#1e1e1e] shadow-lg shadow-[#f3184c]/10'
                    : 'border-transparent hover:bg-gray-200 dark:hover:bg-[#3a3a3a]'
                  }
                  focus:outline-none
                `}
              />

              {/* Search Suggestions */}
              {searchFocused && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#303030] p-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="text-xs font-bold text-gray-400 px-3 py-2">Quick Access</div>
                  <Link to="/academic" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-[#303030] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <span className="text-sm">📊</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">Academic Records</div>
                      <div className="text-xs text-gray-500">View your results</div>
                    </div>
                  </Link>
                  <Link to="/resources" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-[#303030] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <span className="text-sm">📚</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">Study Resources</div>
                      <div className="text-xs text-gray-500">Access materials</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">

            {/* Messages */}
            <button className="relative p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#303030] transition-all active:scale-95 group">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400 group-hover:text-[#f3184c] transition-colors" />
              <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-[#1e1e1e] animate-pulse"></span>
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#303030] transition-all active:scale-95 group"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400 group-hover:text-[#f3184c] transition-colors" />
                <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2.5 w-2 h-2 bg-[#f3184c] rounded-full border-2 border-white dark:border-[#1e1e1e] animate-pulse"></span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#303030] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-gray-100 dark:border-[#303030]">
                    <h3 className="font-black text-gray-900 dark:text-white">Notifications</h3>
                    <p className="text-xs text-gray-500 mt-1">You have 3 unread notifications</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-3 hover:bg-gray-50 dark:hover:bg-[#303030] cursor-pointer transition-colors border-b border-gray-50 dark:border-[#303030]">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm">📝</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">New assignment posted</p>
                          <p className="text-xs text-gray-500 mt-1">Mathematical Analysis - Due Feb 20</p>
                          <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 hover:bg-gray-50 dark:hover:bg-[#303030] cursor-pointer transition-colors border-b border-gray-50 dark:border-[#303030]">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm">✅</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">Grade published</p>
                          <p className="text-xs text-gray-500 mt-1">Database Systems - A</p>
                          <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-100 dark:border-[#303030]">
                    <button className="w-full text-center text-sm font-bold text-[#f3184c] hover:text-[#d01440] transition-colors">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 sm:gap-3 pl-1 pr-2 sm:pr-3 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#303030] transition-all border-2 border-transparent hover:border-gray-200 dark:hover:border-[#303030] active:scale-95"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#f3184c] to-[#d01440] flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#f3184c]/30">
                  {(currentUser?.username?.[0] || 'U').toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                    {currentUser?.username || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {currentUser?.roles?.[0] || 'Student'}
                  </div>
                </div>
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#303030] p-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-3 border-b border-gray-100 dark:border-[#303030] mb-1">
                    <p className="font-black text-gray-900 dark:text-white truncate">
                      {currentUser?.username || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {currentUser?.email || 'student@fasnet.online'}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#303030] hover:text-[#f3184c] transition-all group"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#303030] hover:text-[#f3184c] transition-all group"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                      Settings
                    </Link>
                  </div>

                  <div className="mt-1 pt-1 border-t border-gray-100 dark:border-[#303030]">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#f3184c] hover:bg-[#f3184c]/10 transition-all group"
                    >
                      <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      Sign Out
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
