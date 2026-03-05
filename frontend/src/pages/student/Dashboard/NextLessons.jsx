import React from 'react';

const lessons = [
    {
        id: 1,
        title: '01. Introduction to Creative Writing',
        subtitle: 'Creative writing for beginners',
        teacher: 'ConnerGarcia',
        teacherAvatar: 'https://i.pravatar.cc/150?u=21',
        duration: '22 min',
    },
    {
        id: 2,
        title: '03. Foundations of Public Speaking',
        subtitle: 'Public Speaking and Leadership',
        teacher: 'Saira Goodman',
        teacherAvatar: 'https://i.pravatar.cc/150?u=22',
        duration: '40 min',
    },
    {
        id: 3,
        title: '05. Getting to know the tool Adobe Illustrator',
        subtitle: 'Digital Illustration with Adobe Illustrator',
        teacher: 'Tony Ware',
        teacherAvatar: 'https://i.pravatar.cc/150?u=23',
        duration: '1h 08 min',
    },
    {
        id: 4,
        title: '11. Understanding audience psychology',
        subtitle: 'Public Speaking: Basic course',
        teacher: 'Mya Guzman',
        teacherAvatar: 'https://i.pravatar.cc/150?u=24',
        duration: '26 min',
    },
    {
        id: 5,
        title: '04. The importance of self reflection',
        subtitle: 'Psychology of influence',
        teacher: 'Zohaib Osborn',
        teacherAvatar: 'https://i.pravatar.cc/150?u=25',
        duration: '23 min',
    }
];

const NextLessons = () => {
    return (
        <div className="bg-white rounded-[32px] p-6 lg:p-8 shadow-sm border-[1.5px] border-[#151313]/10 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-[1.5rem] font-bold text-[#151313]">My next lessons</h2>
                <button className="text-[#ff5734] font-bold text-sm hover:underline transition-all">
                    View all lessons
                </button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 pb-3 border-b border-slate-100 text-slate-400 text-sm font-bold">
                <div className="col-span-6">Lesson</div>
                <div className="col-span-4">Teacher</div>
                <div className="col-span-2 text-right">Duration</div>
            </div>

            <div className="flex flex-col flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {lessons.map((lesson, index) => (
                    <div key={lesson.id} className={`grid grid-cols-12 gap-4 py-4 items-center group ${index !== lessons.length - 1 ? 'border-b border-slate-100' : ''}`}>
                        <div className="col-span-6 flex flex-col">
                            <h4 className="text-[#151313] font-bold text-[15px] mb-0.5 leading-tight">{lesson.title}</h4>
                            <p className="text-slate-500 font-medium text-[13px] group-hover:text-[#151313]/70 transition-colors">{lesson.subtitle}</p>
                        </div>
                        <div className="col-span-4 flex items-center gap-3">
                            <img src={lesson.teacherAvatar} alt={lesson.teacher} className="w-8 h-8 rounded-full border border-slate-200" />
                            <span className="text-[#151313] font-medium text-[14px]">{lesson.teacher}</span>
                        </div>
                        <div className="col-span-2 text-right text-slate-500 font-bold text-[14px]">
                            {lesson.duration}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NextLessons;
