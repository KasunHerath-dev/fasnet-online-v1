# 01 - Project Overview (FASNet Online v1.0)

## Welcome to FASNet Online
FASNet Online is the premium Student Ecosystem and Command Center designed specifically for the **Faculty of Applied Sciences (Wayamba University of Sri Lanka)**. 

If you're joining the development team, this document serves as your entry point into understanding **what** we are building and **why** we are building it.

## The Problem
Universities often suffer from fragmented systems—students check one site for grades, another for notices, and use physical boards or WhatsApp for resources. The Student Union struggles with organizing these massive amounts of data, manual student grouping, and delivering academic resources efficiently.

## The Solution
FASNet unifies everything into a single, high-fidelity web application. It acts as a:
1. **Command Center for the Student Union:** Enabling bulk student registration, module assignments, timetable generation, and university-wide announcements managed by the union.
2. **Academic Dashboard for Students:** Gamifying and tracking their academic growth (CGPA, Credits, Result Trends) while consolidating all learning materials securely.

## Technology Stack (MERN+)
The project relies on a robust, modern Javascript tech stack tailored for both serverless scaling and stateful interactions:

### 🎨 Frontend (Client-side)
*   **Core:** React 18, Vite (for rapid HMR and optimized builds)
*   **Routing:** React Router v6
*   **Styling:** TailwindCSS, Vanilla CSS, customized "Leanify Theme"
*   **Data Visualization:** Recharts, `@react-three/drei`, `@react-three/fiber`
*   **Real-time:** `socket.io-client` for live notifications.

### ⚙️ Backend (Server-side)
*   **Core:** Node.js, Express.js v5
*   **Database:** MongoDB Atlas via Mongoose
*   **Authentication:** JWT (JSON Web Tokens), `bcryptjs`, and secure Email OTP activation.
*   **Storage & CDN:** Cloudinary (for images/light assets), Mega (`megajs` for heavy academic documents).
*   **Data Processing:** `xlsx` for parsing bulk admin uploads.

### 🛡️ Best Practices Utilized
*   **Security:** Rate-limiting, Helmet headers, XSS cleaning, Mongo sanitization.
*   **Modular Architecture:** Complete separation of concerns (Routes → Controllers → Services → Models) on the Backend.
*   **Premium UI/UX:** Glassmorphism, smooth animations (Framer Motion logic), and responsive, mobile-first dashboards.

---
*Next Step:* Read `02_features_breakdown.md` to understand what features exist for different user roles.
