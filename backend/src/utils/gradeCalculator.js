const calculateGrade = (marks) => {
    if (marks >= 85) return { grade: 'A+', gp: 4.0, status: 'Passed' };
    if (marks >= 70) return { grade: 'A', gp: 4.0, status: 'Passed' };
    if (marks >= 65) return { grade: 'A-', gp: 3.7, status: 'Passed' };
    if (marks >= 60) return { grade: 'B+', gp: 3.3, status: 'Passed' };
    if (marks >= 55) return { grade: 'B', gp: 3.0, status: 'Passed' };
    if (marks >= 50) return { grade: 'B-', gp: 2.7, status: 'Passed' };
    if (marks >= 45) return { grade: 'C+', gp: 2.3, status: 'Passed' };
    if (marks >= 40) return { grade: 'C', gp: 2.0, status: 'Passed' };
    if (marks >= 35) return { grade: 'C-', gp: 1.7, status: 'Passed' };
    if (marks >= 30) return { grade: 'D+', gp: 1.3, status: 'Passed' };
    if (marks >= 25) return { grade: 'D', gp: 1.0, status: 'Passed' }; // Per user request: 25% is pass
    return { grade: 'E', gp: 0.0, status: 'Failed' };
};

const calculateGPA = (moduleResults) => {
    let totalGP = 0;
    let totalCredits = 0;

    for (const result of moduleResults) {
        // Only count towards GPA if credits exist and it's not an auxiliary course
        if (result.credits > 0) {
            totalGP += result.gradePoint * result.credits;
            totalCredits += result.credits;
        }
    }

    return totalCredits > 0 ? Number((totalGP / totalCredits).toFixed(2)) : 0.0;
};

module.exports = { calculateGrade, calculateGPA };
