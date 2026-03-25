# 05 - Developer Onboarding Guide

Ready to write some code? Here is how to set up the FASNet environment locally.

## 1. Prerequisites
*   **Node.js**: v18 or v20 (LTS recommended)
*   **MongoDB**: Ensure you have a MongoDB Atlas account (free tier works) or a local instance running on port 27017.
*   **Cloudinary**: Sign up for a free CDN account for image/resource hosting.

## 2. Clone and Install
The repository is split into `/frontend` and `/backend`. You must run `npm install` in both.

```bash
git clone https://github.com/KasunHerath-dev/fasnet-online-v1.git
cd fasnet-online-v1

# Install Backend
cd backend
npm install

# Install Frontend
cd ../frontend
npm install
```

## 3. Environment Variables (.env)
You will find `.env.example` files in both directories. Copy them to `.env` and fill in your keys.

**Backend (`/backend/.env`)**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=
JWT_SECRET=super_secret_jwt_key_here
FRONTEND_URL=http://localhost:5173

# Email (for OTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# CDN
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret
```

**Frontend (`/frontend/.env`)**
```env
VITE_API_URL=http://localhost:5000/api/v1
```

## 4. Database Seeding (Crucial Step)
If you attempt to run the frontend without data, it will crash or appear blank. 
FASNet includes standardized WUSL (Wayamba University) mock seeds.

```bash
# Inside the /backend directory
npm run seed-all

# What this does:
# 1. seed.js: Creates Superamdins (admin/admin123), configures system settings.
# 2. seedAcademicData.js: Generates dummy students and module enrollments spanning L1 to L4.
# 3. seedModules.js: Inputs real WUSL curriculum codes and credit weights.
```

## 5. Boot Up
We use Vite for blindingly fast frontend builds and Nodemon for backend reloads. Open two terminals:

```bash
# Terminal 1 => Backend
cd backend
npm run dev

# Terminal 2 => Frontend
cd frontend
npm run dev
```

Navigate to `http://localhost:5173`. 
You can log in via:
*   **Superadmin:** Username: `admin`, Password: `adminpassword` (Check your db seeder logs for precise credentials).
*   **Student:** Use any of the generated Registration Numbers from the `Student` collection, or create a mock student from the Admin UI to test the Activation (OTP) flow. Wait, if using seeded data, check `tests/` or output in console for student logins. Or use admin to bypass OTP and set a password.

Happy coding! Check out the GitHub issues tab to find a ticket to tackle.
