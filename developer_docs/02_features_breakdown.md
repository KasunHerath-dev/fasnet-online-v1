# 02 - Core Features Breakdown

FASNet incorporates a strict Role-Based Access Control (RBAC) Architecture. Depending on whether a user is a **Student** (`user`), a **Promoted Student** (`admin`), or a **Superadmin** (`superadmin`), the system grants access to radically different tools.

## 🧑‍🎓 Student Portal Features
The student interface is highly localized, meaning students only see data pertaining directly to their academic tracking.

1.  **Secure Activation Flow:** New students must verify their identity using their registration number and an Email OTP before setting their passwords.
2.  **Academic Growth Dashboard:** Visualizes Cumulative GPA (CGPA) trends, plots semester-by-semester Grade Points via `recharts`, and predicts Degree Classification (e.g., First Class Honours).
3.  **Student Learning Hub:** A filtered repository of all modules the student is enrolled in. Uses multi-filter dropdowns to find specific Tutorials, Past Papers, or Books hosted on Cloudinary/Mega.
4.  **Profile Change Requests:** Students cannot directly edit sensitive info (like Name, NIC, or Address). They must submit a "Profile Change Request" which pings the Admin portal for verification.
5.  **Notice Board & Timetables:** Real-time sync of faculty notices and custom-rendered exam schedules.

## 👨‍💼 Student Union Portal Features
The admin side (accessible to Union Superadmins and Promoted Users with specific grants) handles the heavy lifting of student data management for the union.

1.  **Bulk Student Registration (CSV):** Admins upload Excel/CSV rosters to instantly map and create thousands of inactive student profiles.
2.  **Bulk Combination Updater:** A specialized tool to map batches of students into specific subject "Combinations" automatically based on query parameters.
3.  **Resource Management:** Admins have direct terminal access to upload PDFs, Docs, and Media. These uploads map directly to specific Modules in the academic schema.
4.  **Profile Validation Queue:** The backend dashboard where Admins approve or reject the `ProfileChangeRequest` submitted by students.
5.  **Analytics Dashboards:** Aggregated views of system health, active users, and academic demographic distributions.

## 🛠️ Hybrid Promoted Users (Union Reps)
Certain students (e.g., batch reps or union members) are given `admin` roles, but not `superadmin`. They load into the **Student Layout** natively but possess additional routing privileges opening up Admin modules (like Bulk Combinations or Resource Uploads) right from their student side-navigation.

---
*Next Step:* Read `03_database_models.md` to see the data structures tying this together.
