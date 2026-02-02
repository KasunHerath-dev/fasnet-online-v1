import { Link, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Cake,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  Settings,
  User,
  GraduationCap,
  TrendingUp,
  BookOpen,
  LogOut,
  Calendar,
  BarChart3
} from 'lucide-react'
import { hasPermission, isRegularUser, isSuperAdmin, PERMISSIONS } from '../utils/permissions'

export default function SideNav({ isOpen, onClose }) {
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState(null)

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const user = authService.getUser()
  const isStudent = isRegularUser(user)
  const isSuperAdminUser = isSuperAdmin(user)

  const iconMap = {
    'Dashboard': LayoutDashboard,
    'My Profile': User,
    'Academic': GraduationCap,
    'Analytics': TrendingUp,
    'Students': Users,
    'Birthdays': Cake,
    'Register': UserPlus,
    'Update Data': RefreshCw,
    'Missing': AlertTriangle,
    'Admin': Settings,
    'Settings': Settings,
    'Resources': BookOpen,
    'Calendar': Calendar,
    'Reports': BarChart3
  }

  const links = []
  links.push({ label: 'Dashboard', path: '/dashboard', icon: 'Dashboard' })

  if (isStudent) {
    links.push(
      { label: 'My Profile', path: '/profile', icon: 'My Profile' },
      { label: 'Academic', path: '/academic', icon: 'Academic' },
      { label: 'Resources', path: '/resources', icon: 'Resources' },
      { label: 'Analytics', path: '/analytics', icon: 'Analytics' }
    )
  } else {
    if (!isSuperAdminUser && user?.studentRef) {
      links.push(
        { label: 'My Profile', path: '/profile', icon: 'My Profile' },
        { label: 'Academic', path: '/academic', icon: 'Academic' },
        { label: 'Resources', path: '/resources', icon: 'Resources' }
      )
    }
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.VIEW_ANALYTICS) || user?.studentRef) {
      links.push({ label: 'Analytics', path: '/analytics', icon: 'Analytics' })
    }
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.VIEW_STUDENTS)) {
      links.push({ label: 'Students', path: '/students', icon: 'Students' })
    }
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.VIEW_BIRTHDAYS)) {
      links.push({ label: 'Birthdays', path: '/birthdays', icon: 'Birthdays' })
    }
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.BULK_IMPORT)) {
      links.push({ label: 'Register', path: '/register-students', icon: 'Register' })
    }
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.BULK_UPDATE)) {
      links.push({ label: 'Update Data', path: '/update-students', icon: 'Update Data' })
    }
    if (!isSuperAdminUser && user?.roles?.includes('admin')) {
      links.push({ label: 'Resource Manager', path: '/admin/resources', icon: 'Resources' })
    }
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.SYSTEM_SETTINGS)) {
      links.push({ label: 'Admin', path: '/admin', icon: 'Admin' })
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Pill Shape Design */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-[100] h-screen
          transition-all duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:m-4 md:h-[calc(100vh-2rem)]
        `}
      >
        <div className="h-full w-20 bg-[#1e1e1e] md:rounded-[2rem] flex flex-col items-center py-6 border-r md:border border-[#303030] shadow-2xl">

          {/* Logo */}
          <div className="mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#f3184c] to-[#d01440] rounded-2xl flex items-center justify-center shadow-lg shadow-[#f3184c]/30">
              <span className="text-white font-black text-xl">F</span>
            </div>
          </div>

          {/* Navigation Icons */}
          <nav className="flex-1 flex flex-col items-center gap-2 w-full px-3">
            {links.map((link, idx) => {
              const Icon = iconMap[link.icon] || LayoutDashboard
              const active = isActive(link.path)

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => {
                    if (window.innerWidth < 768) onClose()
                  }}
                  onMouseEnter={() => setHoveredItem(idx)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    relative w-full h-12 flex items-center justify-center rounded-xl transition-all duration-200 group
                    ${active
                      ? 'bg-[#f3184c] text-white shadow-lg shadow-[#f3184c]/30'
                      : 'text-gray-400 hover:bg-[#303030] hover:text-white'
                    }
                  `}
                  title={link.label}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${active || hoveredItem === idx ? 'scale-110' : ''}`} />

                  {/* Active Indicator */}
                  {active && (
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full" />
                  )}

                  {/* Tooltip on Hover */}
                  <div className="absolute left-full ml-4 px-3 py-2 bg-[#303030] text-white text-sm font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50">
                    {link.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#303030]" />
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="flex flex-col items-center gap-2 w-full px-3 pt-4 border-t border-[#303030]">

            {/* Settings */}
            <Link
              to="/settings"
              onClick={() => {
                if (window.innerWidth < 768) onClose()
              }}
              className={`
                relative w-full h-12 flex items-center justify-center rounded-xl transition-all duration-200 group
                ${isActive('/settings') ? 'bg-[#303030] text-white' : 'text-gray-400 hover:bg-[#303030] hover:text-white'}
              `}
              title="Settings"
            >
              <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />

              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-[#303030] text-white text-sm font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50">
                Settings
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#303030]" />
              </div>
            </Link>

            {/* Logout */}
            <button
              className="relative w-full h-12 flex items-center justify-center rounded-xl transition-all duration-200 text-gray-400 hover:bg-[#f3184c]/10 hover:text-[#f3184c] group"
              onClick={() => authService.logout()}
              title="Logout"
            >
              <LogOut className="w-5 h-5" />

              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-[#303030] text-white text-sm font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50">
                Logout
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#303030]" />
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
