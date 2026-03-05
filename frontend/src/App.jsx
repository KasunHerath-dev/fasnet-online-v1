import React, { useEffect, useState, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { authService } from './services/authService'
import { ToastProvider } from './context/ToastContext'
import { IdleTimerProvider } from './context/IdleTimerContext'
import IdleWarningModal from './components/IdleWarningModal'
import Loader from './components/Loader'
import UnifiedPageLoader from './components/loaders/UnifiedPageLoader'
import LoginPage from './pages/LoginPage'
import AdminLayout from './layouts/AdminLayout'

// Admin Portal
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminUsers from './pages/admin/AdminUsers'
import AdminSettings from './pages/admin/AdminSettings'
import AdminResources from './pages/admin/AdminResources'
import PromotedUserDashboard from './pages/admin/PromotedUserDashboard'
import ExamTimeTablePage from './pages/admin/ExamTimeTablePage'

// Admin > Student Management
import StudentsPage from './pages/admin/Students/StudentsPage'
import StudentDetailPage from './pages/admin/Students/StudentDetailPage'
import StudentCreatePage from './pages/admin/Students/StudentCreatePage'
import BirthdaysPage from './pages/admin/Students/BirthdaysPage'
import RegisterStudentsPage from './pages/admin/Students/RegisterStudentsPage'
import UpdateStudentsPage from './pages/admin/Students/UpdateStudentsPage'
import MissingStudentsPage from './pages/admin/Students/MissingStudentsPage'
import ProfileRequestsPage from './pages/admin/Students/ProfileRequestsPage'
import BulkCombinationPage from './pages/admin/Students/BulkCombinationPage'

// Student Portal
import { socketService } from './services/socketService'
import LayoutWrapper from './components/student/layout/LayoutWrapper'

// Lazy Load Student Pages
const Dashboard = lazy(() => import('./pages/student/Dashboard'))
const AcademicGrowth = lazy(() => import('./pages/student/AcademicGrowth'))
const StudentLearning = lazy(() => import('./pages/student/StudentLearning'))
const SettingsProfile = lazy(() => import('./pages/student/SettingsProfile'))
const StudentSchedule = lazy(() => import('./pages/student/StudentSchedule'))
import './styles/globals.css'

function ProtectedRoute({ children }) {
  const token = authService.getToken()
  const storedUser = authService.getUser()
  if (token) {
    // Validation check if needed
  }
  return token ? (
    <ToastProvider>
      <IdleTimerProvider>
        <IdleWarningModal />
        {children}
      </IdleTimerProvider>
    </ToastProvider>
  ) : <Navigate to="/login" />
}

// Role Protection Wrapper
function AdminRoute({ children, user }) {
  const isStudent = user?.roles?.includes('user') && !user?.roles?.includes('admin') && !user?.roles?.includes('superadmin')
  return isStudent ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    // Initial load
    const initAuth = async () => {
      const token = authService.getToken()
      if (token) {
        // Load from local storage first for fast response
        const storedUser = authService.getUser()
        setUser(storedUser)

        // Then refresh from backend to ensure data (like profile setup flag) is accurate
        try {
          const res = await authService.getCurrentUser()
          if (res.data && res.data.user) {
            authService.setUser(res.data.user)
          }
        } catch (err) {
          console.error('Failed to refresh user session', err)
          if (err.response?.status === 401) {
            authService.logout()
            setUser(null)
          }
        }
      }
      setLoading(false)
    }

    initAuth()

    // Subscribe to auth changes
    const unsubscribe = authService.subscribe((updatedUser) => {
      setUser(updatedUser)
      if (updatedUser) {
        socketService.connect()
      } else {
        socketService.disconnect()
      }
    })

    // Connect if already logged in
    if (authService.getToken()) {
      socketService.connect()
    }

    return () => {
      unsubscribe()
      socketService.disconnect()
    }
  }, [])

  // Handle Dark Mode
  useEffect(() => {
    if (user?.preferences?.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [user?.preferences?.darkMode])

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    socketService.disconnect()
  }

  if (loading) {
    return <Loader />
  }

  const isStudent = user?.roles?.includes('user') && !user?.roles?.includes('admin') && !user?.roles?.includes('superadmin')
  const isSuperAdmin = user?.roles?.includes('superadmin')
  const isPromotedUser = user?.roles?.includes('admin') && !user?.roles?.includes('superadmin')

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              {isStudent ? (
                <Suspense fallback={<UnifiedPageLoader />}>
                  <Routes>
                    <Route element={<LayoutWrapper />}>
                      <Route path="/:id/dashboard" element={<Dashboard />} />
                      <Route path="/:id/academics" element={<AcademicGrowth />} />
                      <Route path="/:id/learning" element={<StudentLearning />} />
                      <Route path="/:id/schedule" element={<StudentSchedule />} />
                      <Route path="/:id/profile" element={<SettingsProfile />} />
                      {/* Fallback for any other route to dashboard */}
                      <Route path="*" element={<Navigate to="/login" replace />} />
                    </Route>
                  </Routes>
                </Suspense>
              ) : (
                <Suspense fallback={<UnifiedPageLoader />}>
                  <Routes>
                    {/* Promoted User (student-admin dual role) — uses student layout */}
                    {isPromotedUser && (
                      <Route element={<LayoutWrapper />}>
                        <Route path="/:id/dashboard" element={<Dashboard />} />
                        <Route path="/:id/academics" element={<AcademicGrowth />} />
                        <Route path="/:id/learning" element={<StudentLearning />} />
                        <Route path="/:id/schedule" element={<StudentSchedule />} />
                        <Route path="/:id/profile" element={<SettingsProfile />} />
                        <Route path="/students" element={<StudentsPage />} />
                        <Route path="/students/new" element={<StudentCreatePage />} />
                        <Route path="/students/:registrationNumber" element={<StudentDetailPage />} />
                        <Route path="/birthdays" element={<BirthdaysPage />} />
                        <Route path="/profile-requests" element={<ProfileRequestsPage />} />
                        <Route path="/register-students" element={<RegisterStudentsPage />} />
                        <Route path="/update-students" element={<UpdateStudentsPage />} />
                        <Route path="/admin" element={<AdminSettings />} />
                        <Route path="/admin/users" element={<AdminUsers />} />
                        <Route path="/admin/resources" element={<AdminResources />} />
                        <Route path="/admin/bulk-combination" element={<BulkCombinationPage />} />
                        <Route path="/admin/analytics" element={<AdminAnalytics />} />
                        <Route path="*" element={<Navigate to={`/${user?.studentRef?.registrationNumber || user?.username}/dashboard`} replace />} />
                      </Route>
                    )}

                    {/* Superadmin — full admin layout */}
                    {isSuperAdmin && (
                      <Route element={<AdminLayout user={user} onLogout={handleLogout} />}>
                        <Route path="/dashboard" element={<AdminDashboard />} />
                        <Route path="/analytics" element={<AdminAnalytics />} />
                        <Route path="/students" element={<StudentsPage />} />
                        <Route path="/students/new" element={<StudentCreatePage />} />
                        <Route path="/students/:registrationNumber" element={<StudentDetailPage />} />
                        <Route path="/birthdays" element={<BirthdaysPage />} />
                        <Route path="/profile-requests" element={<ProfileRequestsPage />} />
                        <Route path="/register-students" element={<RegisterStudentsPage />} />
                        <Route path="/update-students" element={<UpdateStudentsPage />} />
                        <Route path="/missing-students" element={<MissingStudentsPage />} />
                        <Route path="/admin" element={<AdminSettings />} />
                        <Route path="/admin/users" element={<AdminUsers />} />
                        <Route path="/admin/resources" element={<AdminResources />} />
                        <Route path="/admin/analytics" element={<AdminAnalytics />} />
                        <Route path="/admin/bulk-combination" element={<BulkCombinationPage />} />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Route>
                    )}
                  </Routes>
                </Suspense>
              )}
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
