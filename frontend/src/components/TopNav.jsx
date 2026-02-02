import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import { Bell, Search, Menu, User, ChevronDown, LogOut, Settings } from 'lucide-react'
import api from '../services/api'

export default function TopNav({ user, onLogout, onToggleSidebar }) {
  const currentUser = user || authService.getUser()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const userMenuRef = useRef(null)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
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
            ${scrolled ? 'bg-white/90 dark:bg-[#121212]/90 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 shadow-sm' : 'bg-transparent'}
        `}
    >
      <div className="px-4 md:px-8 py-4 flex items-center justify-between gap-4">

        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-4 min-w-[140px]">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          <div className="hidden md:block">
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl px-4 lg:px-8">
          <div className="relative group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="What assignment are you looking for?"
              className="w-full bg-slate-100 dark:bg-[#1e1e1e] border-none rounded-full py-3.5 pl-11 pr-4 text-sm font-medium placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-[#252525] transition-all"
            />
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-[140px] justify-end">

          {/* Notification Bell */}
          <button className="relative p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors group">
            <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#121212]"></span>
          </button>

          {/* User Profile */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {(currentUser?.username?.[0] || 'U').toUpperCase()}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-2 transform origin-top-right animate-in fade-in zoom-in-95 duration-200">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                  <p className="font-bold text-slate-900 dark:text-white truncate">
                    {currentUser?.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {currentUser?.email || 'student@fasnet.online'}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 hover:text-indigo-600 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 hover:text-indigo-600 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </div>

                <div className="mt-1 pt-1 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
