import StudentForm from '../components/StudentForm'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus } from 'lucide-react'

export default function StudentCreatePage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-stitch-bg-light dark:bg-stitch-bg-dark font-display text-slate-900 dark:text-white pb-20 transition-colors duration-300">
            <div className="relative flex flex-col w-full">
                {/* Hero Section */}
                <div className="relative w-full h-[200px] bg-gradient-to-br from-stitch-blue via-[#6b13ec] to-stitch-pink overflow-hidden rounded-b-[2.5rem] shadow-2xl z-10">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-purple-500/30 rounded-full blur-2xl"></div>

                    <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-white/20">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm">
                            Add New Student
                        </h1>
                        <p className="text-blue-100 font-medium text-lg mt-2 tracking-wide">
                            Register a new student into the system
                        </p>
                    </div>
                </div>

                {/* Content Container */}
                <div className="max-w-5xl mx-auto w-full px-4 md:px-6 -mt-12 relative z-20">
                    <button
                        onClick={() => navigate('/students')}
                        className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium bg-black/20 hover:bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl w-fit"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Students
                    </button>

                    <div className="transform transition-all duration-500 hover:-translate-y-1">
                        <StudentForm />
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out;
                }
            `}</style>
        </div>
    )
}
