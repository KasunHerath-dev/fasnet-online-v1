import React from 'react';
import { Bookmark } from 'lucide-react';

const courses = [
    {
        id: 1,
        category: 'Marketing',
        title: 'Creative Writing for Beginners',
        progress: 25,
        progressText: '5/20 lessons',
        students: '+120',
        cardColor: 'bg-[#fce38a]',
        textColor: 'text-[#151313]',
        pillBg: 'bg-[#151313]',
    },
    {
        id: 2,
        category: 'Computer Science',
        title: 'Digital Illustration with Adobe Illustrator',
        progress: 24,
        progressText: '12/50 lessons',
        students: '+80',
        cardColor: 'bg-[#e2d5f8]',
        textColor: 'text-[#151313]',
        pillBg: 'bg-white/50 text-[#151313] border border-[#151313]/10',
    },
    {
        id: 3,
        category: 'Psychology',
        title: 'Public Speaking and Leadership',
        progress: 81,
        progressText: '18/22 lessons',
        students: '+24',
        cardColor: 'bg-[#d4eaf7]',
        textColor: 'text-[#151313]',
        pillBg: 'bg-white/50 text-[#151313] border border-[#151313]/10',
    }
];

const CourseCard = ({ course }) => {
    return (
        <div className={`${course.cardColor} rounded-[32px] p-5 md:p-6 shadow-sm border-[1.5px] border-[#151313]/10 flex flex-col justify-between h-56 xl:h-64`}>
            <div>
                {/* Top: Category Pill & Bookmark */}
                <div className="flex justify-between items-start mb-3 xl:mb-4">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold ${course.pillBg || 'bg-[#151313] text-white'}`}>
                        {course.category}
                    </span>
                    <button className="text-[#151313] hover:opacity-70 transition-opacity">
                        <Bookmark size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Title */}
                <h3 className={`text-xl xl:text-2xl font-bold ${course.textColor} leading-snug line-clamp-2`}>
                    {course.title}
                </h3>
            </div>

            {/* Bottom: Progress & CTA */}
            <div className="mt-auto pt-4">
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold ${course.textColor} opacity-80`}>Progress</span>
                    <span className={`text-xs font-bold ${course.textColor} opacity-80`}>{course.progressText}</span>
                </div>
                <div className="w-full bg-[#151313]/10 rounded-full h-1.5 mb-5 overflow-hidden">
                    <div className={`h-1.5 rounded-full bg-[#151313]`} style={{ width: `${course.progress}%` }}></div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex -space-x-3 items-center">
                        <img src="https://i.pravatar.cc/150?u=11" className={`w-8 h-8 rounded-full border-2 border-[${course.cardColor.replace('bg-[', '').replace(']', '')}] mix-blend-normal z-0`} alt="Stud 1" />
                        <img src="https://i.pravatar.cc/150?u=12" className={`w-8 h-8 rounded-full border-2 border-[${course.cardColor.replace('bg-[', '').replace(']', '')}] mix-blend-normal z-10`} alt="Stud 2" />
                        <img src="https://i.pravatar.cc/150?u=13" className={`w-8 h-8 rounded-full border-2 border-[${course.cardColor.replace('bg-[', '').replace(']', '')}] mix-blend-normal z-20`} alt="Stud 3" />
                        <div className={`w-8 h-8 rounded-full border-2 border-[${course.cardColor.replace('bg-[', '').replace(']', '')}] mix-blend-normal z-30 bg-[#fccc42] flex items-center justify-center text-[10px] font-black text-[#151313]`}>
                            {course.students}
                        </div>
                    </div>
                    <button className="px-5 py-2.5 rounded-[12px] bg-[#ff5734] text-white font-bold text-sm tracking-wide hover:bg-[#ff5734]/90 transition-colors shadow-sm">
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

const MyCourses = () => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <h2 className="text-[1.7rem] font-bold text-[#151313]">My courses</h2>
                <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-1.5 rounded-xl text-sm font-bold bg-[#151313] text-white">All courses</button>
                    <button className="px-4 py-1.5 rounded-xl text-sm font-bold border border-[#151313]/20 text-[#151313] hover:bg-black/5 transition-colors">Marketing</button>
                    <button className="px-4 py-1.5 rounded-xl text-sm font-bold border border-[#151313]/20 text-[#151313] hover:bg-black/5 transition-colors">Computer Science</button>
                    <button className="px-4 py-1.5 rounded-xl text-sm font-bold border border-[#151313]/20 text-[#151313] hover:bg-black/5 transition-colors">Psychology</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
        </div>
    );
};

export default MyCourses;
