# 🚀 Vercel Deployment Guide

Follow these exact steps to deploy **FASNet Online** from scratch using Vercel.

## 📋 Prerequisites
1.  **GitHub Repository**: Ensure your latest code is pushed to main.
2.  **MongoDB Atlas**: You need a connection string (`mongodb+srv://...`).
3.  **Vercel Account**: Logged in and ready.

---

## 1️⃣ Deploy Backend (Server)

1.  Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  **Import** your GitHub repository (`fasnet-online-v1`).
4.  **Configure Project**:
    *   **Project Name**: `fasnet-online-v1-backend` (Recommended).
    *   **Framework Preset**: `Other` (Default is usually fine, but ensure it picks up Node.js).
    *   **Root Directory**: Click `Edit` and select `backend`. **(Important!)**
    *   **Build & Output Settings** (Expand this section):
        *   **Build Command**: Toggle **OVERRIDE** and enter:
            `echo "No build step"`
        *   **Output Directory**: Toggle **OVERRIDE** and enter:
            `.`
        *   **Install Command**: Leave default (`npm install`).
5.  **Environment Variables**:
    Add the following variables:
    *   `MONGO_URI`: `your_mongodb_connection_string`
    *   `JWT_SECRET`: `sahgd87qw6re87eyqwajdequce9ysa98du cwqour98uq`
    *   `NODE_ENV`: `production`
    *   `FRONTEND_URL`: `https://fasnet-online-v1-frontend.vercel.app` (You will confirm this URL in Step 2).
6.  Click **Deploy**.

> **Note**: If you see a "404 not found" on the backend URL, that's normal for the root path `/`. Try `/api/v1/health` to verify it's working.

---

## 2️⃣ Deploy Frontend (Client)

1.  Go to the [Vercel Dashboard](https://vercel.com/dashboard) again.
2.  Click **"Add New..."** -> **"Project"**.
3.  **Import** the SAME GitHub repository again.
4.  **Configure Project**:
    *   **Project Name**: `fasnet-online-v1-frontend` (Recommended).
    *   **Framework Preset**: `Vite` (Vercel should detect this automatically).
    *   **Root Directory**: Click `Edit` and select `frontend`. **(Important!)**
    *   **Build & Output Settings**:
        *   **Build Command**: `npm run build` (Default)
        *   **Output Directory**: `dist` (Default)
        *   **Install Command**: `npm install` (Default)
5.  **Environment Variables**:
    *   `VITE_API_BASE_URL`: `https://fasnet-online-v1-backend.vercel.app` (The URL of the backend you just deployed).
6.  Click **Deploy**.

---

## 3️⃣ Final Configuration Check

1.  **Update Backend CORS (If needed)**:
    *   If your frontend URL is different from what you guessed in Step 1, go back to your **Backend Project Settings** -> **Environment Variables**.
    *   Update `FRONTEND_URL` to the *actual* deployed frontend URL.
    *   **Redeploy** the Backend (Deployments -> three dots -> Redeploy) for changes to take effect.

---

## 4️⃣ Create the First Admin User 👑

You cannot create the first admin via the website. You must run the seed script locally.

1.  Open your local terminal (VS Code).
2.  Set your MongoDB URI temporarily:
    *   **Windows (PowerShell)**:
        ```powershell
        $env:MONGO_URI="mongodb+srv://kasunherath1969_db_user:..."
        ```
    *   **Mac/Linux**:
        ```bash
        export MONGO_URI="mongodb+srv://kasunherath1969_db_user:..."
        ```
3.  Run the seed script:
    ```bash
    npm run seed --prefix backend
    ```
4.  **Success!** You will see `🎉 Super Admin created successfully!`.

---

## 5️⃣ First Login

1.  Go to your **Frontend URL**.
2.  Login with:
    *   **Username**: `admin`
    *   **Password**: `Fas@2024!`
3.  You will be prompted to reset your password immediately.
