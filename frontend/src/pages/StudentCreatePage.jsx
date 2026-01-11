import StudentForm from '../components/StudentForm'
import { useNavigate } from 'react-router-dom'

export default function StudentCreatePage() {
    const navigate = useNavigate()

    return (
        <div className="p-6">
            <div className="mb-4">
                <button
                    onClick={() => navigate('/students')}
                    className="text-blue-600 hover:underline mb-4"
                >
                    &larr; Back to Students
                </button>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Student</h1>
                <StudentForm />
            </div>
        </div>
    )
}
