import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import {
  Database,
  Shield,
  GraduationCap,
  ArrowRight,
  User,
  Lock,
  TrendingUp,
  Eye,
  EyeOff,
  UserPlus,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Bell,
  BookOpen
} from 'lucide-react'
import AccountActivationModal from '../components/AccountActivationModal'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authService.login(username, password)
      authService.setToken(response.data.token)
      const authenticatedUser = response.data.user;
      authService.setUser(authenticatedUser)
      const regNum = authenticatedUser?.studentRef?.registrationNumber || authenticatedUser?.username || '';
      navigate(regNum ? `/${regNum}/dashboard` : '/login', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex font-['Kodchasan'] tracking-wide">
      {/* Left Side - Hero / Info (Learnify Primary Dark) */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#151313] relative overflow-hidden flex-col justify-between p-16 text-white rounded-r-[4rem] shadow-2xl z-10">

        {/* Brand / Logo Section */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff5734] to-[#fccc42] p-[2px]">
            <div className="w-full h-full bg-[#151313] rounded-[0.9rem] flex items-center justify-center">
              <span className="font-black text-2xl text-white">F</span>
            </div>
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter block leading-none">FASNET</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#be94f5] font-bold">LMS Ecosystem</span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-gradient-to-bl from-[#ff5734]/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[#fccc42]/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Main Content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#fccc42] text-xs font-bold mb-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <Sparkles size={14} />
            <span>Redefining Student Experience</span>
          </div>

          <h1 className="text-6xl font-black mb-8 leading-[1.1]">
            Your Future <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5734] via-[#be94f5] to-[#fccc42] animate-shimmer bg-[length:200%_auto]">
              Starts Here.
            </span>
          </h1>

          <p className="text-lg text-slate-400 mb-12 leading-relaxed max-w-md font-medium">
            Join the elite community of the Faculty of Applied Sciences. Manage your academic growth with the most intuitive student portal ever built.
          </p>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center gap-5 group transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#fccc42] group-hover:scale-110 group-hover:bg-[#fccc42]/10 transition-all">
                <TrendingUp size={22} />
              </div>
              <div>
                <p className="font-bold text-white tracking-normal uppercase text-xs mb-1">Visualize Your Growth</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Track your academic milestones and GPA performance with precision analytics.</p>
              </div>
            </div>

            <div className="flex items-center gap-5 group transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ff5734] group-hover:scale-110 group-hover:bg-[#ff5734]/10 transition-all">
                <BookOpen size={22} />
              </div>
              <div>
                <p className="font-bold text-white tracking-normal uppercase text-xs mb-1">Resources On-Demand</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Instantly access all course materials and essential documents whenever you need them.</p>
              </div>
            </div>

            <div className="flex items-center gap-5 group transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#be94f5] group-hover:scale-110 group-hover:bg-[#be94f5]/10 transition-all">
                <Bell size={22} />
              </div>
              <div>
                <p className="font-bold text-white tracking-normal uppercase text-xs mb-1">Never Miss a Beat</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Get instant notifications on faculty news, exam schedules, and important updates.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
          <span>&copy; 2026 FASNET.ONLINE</span>
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            System Status: Active
          </span>
        </div>
      </div>

      {/* Right Side - Login Form (Learnify Light Theme) */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 bg-[#f7f7f5] overflow-y-auto">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-8 duration-700">

          <div className="mb-12">
            <h2 className="text-4xl font-black text-[#151313] tracking-tighter">Student Login</h2>
            <p className="mt-3 text-slate-500 font-bold">Enter your credentials to access the portal.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="text-left group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-2">
                  Username / ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#ff5734] transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full h-16 pl-14 pr-5 border-2 border-slate-200 rounded-2xl bg-white text-[#151313] font-bold placeholder:text-slate-300 focus:outline-none focus:border-[#ff5734] focus:ring-4 focus:ring-[#ff5734]/5 transition-all outline-none"
                    placeholder="E.g. 242074"
                    required
                  />
                </div>
              </div>

              <div className="text-left group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-2">
                  Security Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#ff5734] transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full h-16 pl-14 pr-14 border-2 border-slate-200 rounded-2xl bg-white text-[#151313] font-bold placeholder:text-slate-300 focus:outline-none focus:border-[#ff5734] focus:ring-4 focus:ring-[#ff5734]/5 transition-all outline-none"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-300 hover:text-[#ff5734] transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-100 flex items-center gap-3 text-red-600 animate-in shake duration-300">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <p className="text-xs font-black uppercase tracking-wider">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full h-16 bg-[#ff5734] hover:bg-[#ff6d4d] rounded-2xl font-black text-white text-lg shadow-xl shadow-[#ff5734]/20 hover:shadow-[#ff5734]/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="uppercase tracking-[0.1em]">Verify & Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer transition-transform"></div>
            </button>
          </form>

          {/* Secondary Actions */}
          <div className="mt-12 pt-8 border-t border-slate-200 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <p className="text-[10px] font-black text-slate-400 bg-[#f7f7f5] px-4 -mt-10 mb-4 uppercase tracking-[0.2em]">
                New to the portal?
              </p>
              <button
                onClick={() => setIsActivationModalOpen(true)}
                className="w-full flex items-center justify-center gap-3 h-14 border-2 border-[#151313] bg-transparent rounded-2xl text-[13px] font-black text-[#151313] hover:bg-[#151313] hover:text-white transition-all transform hover:shadow-lg active:scale-95 group uppercase tracking-widest"
              >
                <UserPlus size={18} />
                Activate Student Account
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <CheckCircle2 size={14} className="text-emerald-500" />
                SSL Secured
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-300"></div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <GraduationCap size={14} className="text-[#ff5734]" />
                FAS Certified
              </div>
            </div>
          </div>
        </div>
      </div>

      <AccountActivationModal
        isOpen={isActivationModalOpen}
        onClose={() => setIsActivationModalOpen(false)}
      />
    </div>
  )
}
