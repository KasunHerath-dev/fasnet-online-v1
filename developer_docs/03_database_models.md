# 03 - Database Architecture & Models

FASNet uses a dynamic schema-based architecture via **Mongoose** for MongoDB. This structure allows us to decouple Authentication systems from Academic tracking systems to ensure security and scalability.

## 1. Identity & Access
*   `User.js`
    *   Handles Authentication, Passwords (hashed via bcrypt), Roles array (`['user']`, `['admin']`, `['superadmin']`), and login timestamps.
    *   Contains a `studentRef` mapping to the `Student` object ID.
*   `Student.js`
    *   Contains ALL personal metadata: Registration number, Index Number, Name, Address, Contact details, degree combinations, Level, Semester, and cumulative academic totals (GPA/Credits).

## 2. Academic Core
*   `BatchYear.js` / `MissingStudent.js`
    *   Operational records tracking cohort populations and anomalies during physical enrollment.
*   `Module.js`
    *   A class/subject representation (e.g., "CMBA 1113"). Defines credit weighting, semester, and title.
*   `ModuleEnrollment.js`
    *   Tracks the many-to-many relationship of a single `Student` subscribing to a specific `Module`.

## 3. Gradebook Matrix
*   `Assessment.js` & `AssessmentResult.js`
    *   Tracks sub-exams (midterms, assignments) mapped to Modules.
*   `Result.js`
    *   The formalized final grade (e.g., 'A+', 'B') a student achieves for a specific `Module`. Used heavily to calculate GPU.
*   `SemesterResult.js`
    *   Aggregates the total Grade Points and Credits for a specific semester level. Used by the Recharts graphs in the UI.

## 4. Ecosystem & Comms
*   `Resource.js`
    *   Tracks the digital footprint of a file (URL, Type: 'past_paper', 'tutorial') and maps it to a `Module`.
*   `Notice.js` & `Notification.js`
    *   The broadcast system sending alerts and news to users.
*   `ProfileChangeRequest.js`
    *   The holding pattern for a student attempting to alter their metadata. Statuses include `pending`, `approved`, or `rejected`.
*   `SystemSetting.js`
    *   Global config toggles for Superadmins.

## How they intertwine
When fetching the Student Dashboard, the backend joins `User` -> `Student` -> `ModuleEnrollment` -> `Result` to calculate the dynamic CGPA instantly.
