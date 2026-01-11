import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { Code2, Database, Shield, GraduationCap, ArrowRight, User, Lock, TrendingUp, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authService.login(username, password)
      authService.setToken(response.data.token)
      authService.setUser(response.data.user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Hero / Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 relative overflow-hidden flex-col justify-between p-16 text-white">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
            <span className="font-bold text-2xl">F</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">fasnet.online</span>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-black mb-6 leading-tight">
            Review Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Academic Journey
            </span>
          </h1>
          <p className="text-lg text-indigo-200 mb-8 leading-relaxed">
            Welcome to the Faculty of Applied Sciences Database System.
            Access your student profile, academic resources, and analytics in one unified platform.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-indigo-100">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur">
                <Database className="w-5 h-5" />
              </div>
              <p>Centralized Student Data Management</p>
            </div>
            <div className="flex items-center gap-4 text-indigo-100">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur">
                <GraduationCap className="w-5 h-5" />
              </div>
              <p>Academic Resource Tracking</p>
            </div>
            <div className="flex items-center gap-4 text-indigo-100">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p>Track GPA & Academic Progress</p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 text-sm text-indigo-300">
          <p>Developed by Kasun Herath</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900">Welcome Back!</h2>
            <p className="mt-2 text-gray-500">Please sign in to your account</p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-600 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-gray-900"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-600 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-gray-900"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-purple-500/30 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            © 2024 fasnet.online • Developed by Kasun Herath
          </p>
        </div>
      </div>
    </div>
  )
}
