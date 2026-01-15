# FASNet Online v1.0 🎓

**Faculty of Applied Sciences - Student Management & Resource System**

A comprehensive web application for managing student profiles, academic progression, and faculty resources. Built with a modern **MERN Stack** (MongoDB, Express, React, Node.js).

## 🚀 Tech Stack

*   **Frontend**: React (Vite), TailwindCSS, Framer Motion (Animations), Axios.
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB Atlas.
*   **Authentication**: JWT (JSON Web Tokens).
*   **Hosting**: Vercel (Frontend & Backend).

## 📂 Project Structure

*   `/frontend` - React User Interface.
*   `/backend` - API Server & Database Logic.

## 🛠️ Local Development

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    ```

2.  **Install Dependencies**:
    ```bash
    # Install backend deps
    cd backend
    npm install

    # Install frontend deps
    cd ../frontend
    npm install
    ```

3.  **Run Locally**:
    ```bash
    # Backend (Port 5000)
    cd backend
    npm run dev

    # Frontend (Port 5173)
    cd frontend
    npm run dev
    ```

## 🔐 Admin Setup

The system requires an initial Admin user to be seeded into the database. Check `VERCEL_GUIDE.md` for production setup instructions.
