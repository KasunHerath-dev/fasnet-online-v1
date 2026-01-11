# 🎓 FASNet Online - Student Management System

A comprehensive student management system for the Faculty of Applied Sciences, Wayamba University of Sri Lanka (WUSL).

## 📋 Features

- **Student Management**: Track student records, academic progress, and performance
- **Module System**: 99+ official WUSL modules across 4 levels
- **GPA Calculation**: Automatic GPA calculation with WUSL grading system
- **Resource Management**: Upload and manage academic resources by module
- **Real-time Dashboard**: Live updates on student activities
- **Permission System**: Role-based access control for admins
- **Batch Management**: Track multiple academic batches (2020-2024)

## 🏗️ Tech Stack

**Frontend:**
- React + Vite
- TailwindCSS
- React Router
- Lucide Icons

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Socket.io (real-time)
- JWT Authentication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd fasnet-deploy
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and secrets
   npm run seed       # Create admin user
   npm run seed-academic  # Seed batch years
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your backend URL
   npm run dev
   ```

4. **Default Login**
   - Username: `admin`
   - Password: `Fas@2024!`
   - ⚠️ Change this immediately after first login!

## 📦 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions for:
- **Backend**: Render.com (recommended)
- **Frontend**: Vercel
- **Database**: MongoDB Atlas

## 🗂️ Project Structure

```
fasnet-deploy/
├── backend/              # Node.js API
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, validation
│   │   └── utils/        # Helpers
│   ├── scripts/          # Seed scripts
│   └── server.js         # Entry point
│
├── frontend/             # React App
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Route pages
│   │   ├── services/     # API clients
│   │   └── utils/        # Helpers
│   └── index.html
│
└── DEPLOYMENT_GUIDE.md   # Deployment instructions
```

## 👨‍💻 Development

```bash
# Backend Dev Mode
cd backend
npm run dev

# Frontend Dev Mode  
cd frontend
npm run dev
```

## 📝 License

Developed by Kasun Herath for WUSL Faculty of Applied Sciences.

## 🤝 Support

For issues or questions, contact: deanfas@wyb.ac.lk
