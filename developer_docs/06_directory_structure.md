# 06 - Directory & Folder Structure

To help you navigate the codebase quickly, here is a breakdown of the standard file tree used across the MERN stack for FASNet.

## Root Level
```text
fasnet-online-v1/
├── backend/            # Express.js REST API Server
├── frontend/           # React + Vite Client Application
├── developer_docs/     # The documentation you are currently reading
├── .gitignore          # Ignoring node_modules, .env files, etc.
└── README.md           # The quickstart guide for the repository
```

## Backend Structure (`/backend`)
```text
backend/
├── src/
│   ├── controllers/    # Business logic for endpoints (e.g., authController.js)
│   ├── middleware/     # Custom auth & error-handling middleware (e.g., authWrapper.js)
│   ├── models/         # Mongoose DB Schemas (Student, User, Module, etc.)
│   ├── routes/         # Express endpoint definitions mapping to controllers
│   ├── services/       # 3rd-party integrations (Cloudinary, Email/Nodemailer)
│   ├── utils/          # Helper functions, loggers, and constants
│   └── socket.js       # Real-time Socket.IO configuration
├── scripts/            # Database Seeders for testing data
├── tests/              # Jest / testing scripts
├── uploads/            # Temporary directory for file parsing before CDN upload
├── .env                # Secret environment variables
├── package.json        # Node dependencies & running scripts
└── server.js           # The Express Application Entry Point
```

## Frontend Structure (`/frontend`)
```text
frontend/
├── src/
│   ├── assets/         # Static images, SVGs, and branding
│   ├── components/     # Reusable UI Blocks (See 08_frontend_components)
│   ├── context/        # React Context Providers (Toast, IdleTimer)
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Page wrappers dividing Admin vs Student UI
│   ├── pages/          # The actual routable views (Dashboard, Timetable, etc.)
│   ├── services/       # Axios wrappers bridging the Frontend to the Backend API
│   ├── styles/         # Global CSS, Tailwind base injections
│   ├── App.jsx         # The main Router Tree & Authentication Wrapper
│   └── main.jsx        # React DOM mounting point
├── public/             # Public assets like favicon
├── .env                # Client-facing environment variables (VITE_ prefixed)
├── tailwind.config.js  # Color schemes, fonts (Kodchasan), animations
└── vite.config.js      # Bundler configurations
```

### Why is it structured this way?
1.  **Separation of Concerns:** The backend strictly separates `routes` (URL paths) from `controllers` (the JS logic). This means you can test logic without spinning up fake HTTP requests.
2.  **Scalable Frontend:** The `pages` directory contains views, but standard buttons, navbars, and loaders are abstracted into `components` so they can be reused across the UI without duplicating code.
