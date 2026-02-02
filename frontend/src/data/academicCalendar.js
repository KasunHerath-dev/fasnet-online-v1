
// Placeholder data based on "Sem I 2023-2024" context
export const ACADEMIC_CALENDAR = [
    {
        id: 1,
        event: "Semester I Begins",
        date: "2023-10-02",
        type: "academic",
        description: "Commencement of academic activities for Semester I"
    },
    {
        id: 2,
        event: "Mid-Semester Break",
        date: "2023-11-20",
        endDate: "2023-11-26",
        type: "holiday",
        description: "One week break for students"
    },
    {
        id: 3,
        event: "Study Leave",
        date: "2024-01-15",
        endDate: "2024-01-21",
        type: "exam-prep",
        description: "Study leave before final examinations"
    },
    {
        id: 4,
        event: "Semester I Examinations",
        date: "2024-01-22",
        endDate: "2024-02-18",
        type: "exam",
        description: "Final examinations for all levels"
    },
    {
        id: 5,
        event: "Semester Break",
        date: "2024-02-19",
        endDate: "2024-03-03",
        type: "holiday",
        description: "End of semester vacation"
    }
];

export const getKeyDates = () => {
    const today = new Date();
    return ACADEMIC_CALENDAR.filter(event => new Date(event.endDate || event.date) >= today);
};
