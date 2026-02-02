
// Placeholder data based on "Exam Time Table Level 1-2-3-4" context
// This structure assumes we can filter by Student Level/Semester

export const EXAM_TIMETABLE = [
    // Level 1 Exams
    {
        code: "CSC1113",
        title: "Introduction to Computing",
        date: "2024-01-22",
        time: "09:00 AM - 12:00 PM",
        venue: "Main Hall",
        level: 1,
        semester: 1
    },
    {
        code: "CSC1122",
        title: "Programming Fundamentals",
        date: "2024-01-24",
        time: "01:00 PM - 04:00 PM",
        venue: "Laboratory A",
        level: 1,
        semester: 1
    },
    // Level 2 Exams
    {
        code: "CSC2113",
        title: "Data Structures & Algorithms",
        date: "2024-01-23",
        time: "09:00 AM - 12:00 PM",
        venue: "Hall 2",
        level: 2,
        semester: 1
    },
    {
        code: "CSC2122",
        title: "Database Management Systems",
        date: "2024-01-25",
        time: "02:00 PM - 05:00 PM",
        venue: "Lab 1",
        level: 2,
        semester: 1
    },
    // Level 3 Exams
    {
        code: "CSC3113",
        title: "Software Engineering",
        date: "2024-01-22",
        time: "01:00 PM - 04:00 PM",
        venue: "Main Hall",
        level: 3,
        semester: 1
    },
    {
        code: "CSC3122",
        title: "Web Technologies",
        date: "2024-01-26",
        time: "09:00 AM - 12:00 PM",
        venue: "Lab 2",
        level: 3,
        semester: 1
    },
    // Level 4 Exams
    {
        code: "CSC4113",
        title: "Advanced Networking",
        date: "2024-01-29",
        time: "09:00 AM - 12:00 PM",
        venue: "Seminar Room",
        level: 4,
        semester: 1
    }
];

export const getStudentExams = (level) => {
    // Return exams for the specific level, sorted by date
    return EXAM_TIMETABLE
        .filter(exam => exam.level === parseInt(level))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
};
