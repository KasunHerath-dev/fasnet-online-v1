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


  const isActive = (path) => {
    if (path.includes('?tab=')) {
      const tab = path.split('?tab=')[1];
      const currentTab = new URLSearchParams(location.search).get('tab') || 'overview';
      return location.pathname === '/dashboard' && currentTab === tab;
    }
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

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
  links.push({ label: 'Dashboard', path: '/dashboard?tab=overview', icon: 'Dashboard' })

  if (isStudent) {
    links.push(
      { label: 'My Profile', path: '/dashboard?tab=profile', icon: 'My Profile' },
      { label: 'Academic', path: '/dashboard?tab=academic', icon: 'Academic' },
      { label: 'Resources', path: '/dashboard?tab=resources', icon: 'Resources' },
      { label: 'Analytics', path: '/dashboard?tab=analytics', icon: 'Analytics' }
    )
  } else {
    if (!isSuperAdminUser && user?.studentRef) {
      links.push(
        { label: 'My Profile', path: '/dashboard?tab=profile', icon: 'My Profile' },
        { label: 'Academic', path: '/dashboard?tab=academic', icon: 'Academic' },
        { label: 'Resources', path: '/dashboard?tab=resources', icon: 'Resources' }
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
          group
        `}
      >
        <div className="h-full w-16 md:w-20 md:group-hover:w-60 bg-[#1e1e1e] md:rounded-[2rem] flex flex-col items-center py-6 border-r md:border border-[#303030] shadow-2xl transition-all duration-300">

          {/* Logo */}
          <div className="mb-8 flex items-center justify-center md:justify-start gap-3 w-full px-2 md:px-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#f3184c] to-[#d01440] rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-[#f3184c]/30 flex-shrink-0">
              <span className="text-white font-black text-lg md:text-xl">F</span>
            </div>
            <div className="overflow-hidden w-0 md:group-hover:w-auto transition-all duration-300 opacity-0 md:group-hover:opacity-100 whitespace-nowrap">
              <span className="font-black text-white text-lg">fasnet</span>
            </div>
          </div>

          {/* Navigation Icons */}
          <nav className="flex-1 flex flex-col items-center gap-2 w-full px-2 md:px-3">
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
                    relative w-full h-11 md:h-12 flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 rounded-xl transition-all duration-200
                    ${active
                      ? 'bg-[#f3184c] text-white shadow-lg shadow-[#f3184c]/30'
                      : 'text-gray-400 hover:bg-[#303030] hover:text-white'
                    }
                  `}
                  title={link.label}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${active || hoveredItem === idx ? 'scale-110' : ''}`} />

                  {/* Label - shows on hover */}
                  <span className="overflow-hidden w-0 md:group-hover:w-auto transition-all duration-300 opacity-0 md:group-hover:opacity-100 whitespace-nowrap font-bold text-sm">
                    {link.label}
                  </span>

                  {/* Active Indicator */}
                  {active && (
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="flex flex-col items-center gap-2 w-full px-2 md:px-3 pt-4 border-t border-[#303030]">

            {/* Settings */}
            <Link
              to="/settings"
              onClick={() => {
                if (window.innerWidth < 768) onClose()
              }}
              className={`
                relative w-full h-11 md:h-12 flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 rounded-xl transition-all duration-200
                ${isActive('/settings') ? 'bg-[#303030] text-white' : 'text-gray-400 hover:bg-[#303030] hover:text-white'}
              `}
              title="Settings"
            >
              <Settings className="w-5 h-5 flex-shrink-0 group-hover:rotate-90 transition-transform duration-300" />
              <span className="overflow-hidden w-0 md:group-hover:w-auto transition-all duration-300 opacity-0 md:group-hover:opacity-100 whitespace-nowrap font-bold text-sm">
                Settings
              </span>
            </Link>

            {/* Logout */}
            <button
              className="relative w-full h-11 md:h-12 flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 rounded-xl transition-all duration-200 text-gray-400 hover:bg-[#f3184c]/10 hover:text-[#f3184c]"
              onClick={() => authService.logout()}
              title="Logout"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="overflow-hidden w-0 md:group-hover:w-auto transition-all duration-300 opacity-0 md:group-hover:opacity-100 whitespace-nowrap font-bold text-sm">
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
