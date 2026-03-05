import React from 'react';

const StudentSchedule = () => {
    return (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/50">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Schedule & Exams</h2>
            <p className="text-slate-500">View your weekly class timetable and upcoming exam dates.</p>
            {/* TODO: Port existing ExamTimeTable content here */}
        </div>
    );
};

export default StudentSchedule;

