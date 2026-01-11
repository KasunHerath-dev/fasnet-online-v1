# 🚀 Fresh Vercel Deployment Guide

This guide will walk you through deploying your fresh project to Vercel and setting up the admin user.

## 🛠️ Step 1: Push to GitHub

Since you have a fresh git repository with all the necessary changes, simply push it to your new GitHub repository.

```bash
# Replace with your NEW GitHub repository URL
git remote add origin https://github.com/KasunHerath-dev/fasnet-online-new.git
git branch -M main
git push -u origin main
```

## ☁️ Step 2: Deploy Backend to Vercel

1.  Go to [vercel.com/new](https://vercel.com/new).
2.  Import your **new** GitHub repository.
3.  **Project Name**: `fasnet-online-backend` (or similar).
4.  **Root Directory**: Click "Edit" and select `backend`.
5.  **Environment Variables**:
    *   `MONGO_URI`: Your MongoDB connection string (e.g., `mongodb+srv://user:pass@cluster...`)
    *   `JWT_SECRET`: A secure random string.
    *   `NODE_ENV`: `production`
6.  Click **Deploy**.
7.  **Copy the Backend URL** (e.g., `https://fasnet-online-backend.vercel.app`).

## 🖥️ Step 3: Deploy Frontend to Vercel

1.  Go to [vercel.com/new](https://vercel.com/new).
2.  Import the **same** GitHub repository again.
3.  **Project Name**: `fasnet-online-frontend` (or similar).
4.  **Framework Preset**: Select **Vite**.
5.  **Root Directory**: Click "Edit" and select `frontend`.
6.  **Environment Variables**:
    *   `VITE_API_BASE_URL`: The **Backend URL** from Step 2 (e.g., `https://fasnet-online-backend.vercel.app`).
        *   ⚠️ **Important**: No trailing slash `/` at the end!
7.  Click **Deploy**.
8.  **Copy the Frontend URL**.

## 🔄 Step 4: Finalize Backend Configuration

1.  Go back to your **Backend Project** in Vercel.
2.  Go to **Settings** -> **Environment Variables**.
3.  Add `FRONTEND_URL` with your **Frontend URL** (e.g., `https://fasnet-online-frontend.vercel.app`).
4.  **Redeploy** the backend for changes to take effect:
    *   Go to **Deployments** tab -> Click three dots (⋮) on latest deployment -> **Redeploy**.

## 👤 Step 5: Create Super Admin User

Since Vercel console access is limited, the easiest way is to use the script we created locally **but connecting to your production database**.

1.  In your local terminal, go to: `d:\My Test\FAS DATA BASE\workspace - 02\fasnet-deploy\backend`
2.  Run the script with your production MongoDB URI:

    ```powershell
    # Windows PowerShell
    $env:MONGO_URI="your_mongodb_connection_string"
    node scripts/createAdminProd.js
    ```

    *   *Make sure to replace `your_mongodb_connection_string` with your actual connection string.*

3.  **Success!** You should see: `🎉 Super Admin created successfully!`

## 🔐 Login Credentials

*   **URL**: Your Frontend Vercel URL
*   **Username**: `admin`
*   **Password**: `Fas@2024!`
*   **Action**: Change password immediately!
