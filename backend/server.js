require('dotenv').config(); // Standard config, relies on Vercel Env Vars in production
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./src/utils/logger');

// Prevent crashes from unhandled errors
mongoose.set('strictQuery', false);
mongoose.set('bufferCommands', false); // Fail immediately if disconnected (Serverless Best Practice)

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down gracefully...');
  console.error(err.name, err.message);
  // process.exit(1); // Don't exit in serverless, let the request fail
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥');
  console.error(err.name, err.message);
});

// Route Imports
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const academicRoutes = require('./src/routes/academicRoutes');
const progressionRoutes = require('./src/routes/progressionRoutes');
const profileRequestRoutes = require('./src/routes/profileRequestRoutes');
const importRoutes = require('./src/routes/importRoutes');
const missingStudentRoutes = require('./src/routes/missingStudentRoutes');
const batchYearRoutes = require('./src/routes/batchYearRoutes');

const app = express();

const helmet = require('helmet');
// const xss = require('xss-clean'); // Commented out due to incompatibility
// const mongoSanitize = require('express-mongo-sanitize'); // Commented out due to incompatibility
const rateLimit = require('express-rate-limit');

// Middleware
app.use(helmet()); // Set security headers
app.use(express.json({ limit: '10kb' })); // Body limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again in 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
// app.use('/api', limiter); // Disabled for Vercel (Shared IPs cause false positives)

// CORS Configuration
const allowedOrigins = [
  'https://fasnet-online-frontend.vercel.app',
  'https://fasnet-online-v1-frontend.vercel.app', // Explicitly allow v1 deployment
  'https://www.fasnet-online-v1-frontend.vercel.app', // Allow www subdomain
  'http://localhost:5173',  // Local Vite dev server
  'http://localhost:3000',  // Alternative local port
  'http://localhost:4173',  // Vite preview
  process.env.FRONTEND_URL, // Additional frontend URL from environment variables
].filter(Boolean); // Remove undefined values

// Preflight handled by app.use(cors(...)) below

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan('combined'));

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/academic', academicRoutes);
app.use('/api/v1/progression', progressionRoutes);
app.use('/api/v1/profile-requests', profileRequestRoutes);
app.use('/api/v1/import', importRoutes);
app.use('/api/v1/missing-students', missingStudentRoutes);
app.use('/api/v1/batch-years', batchYearRoutes);
app.use('/api/v1/assessments', require('./src/routes/assessmentRoutes'));
app.use('/api/v1/system', require('./src/routes/systemRoutes'));
app.use('/api/v1/resources', require('./src/routes/resourceRoutes'));

// Health Check
app.get('/api/v1/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    dbState: statusMap[dbStatus] || 'Unknown',
    env: process.env.NODE_ENV
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Endpoint not found', code: 'NOT_FOUND' } });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
  });
});

// Database Connection & Server Start
const http = require('http');
const { initializeSocket } = require('./src/socket');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io (Only in development/server mode, not Vercel serverless)
if (process.env.NODE_ENV !== 'production') {
  initializeSocket(server);
}

const startServer = () => {
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`, { env: process.env.NODE_ENV });
  });
};

// MongoDB Connection Pattern for Serverless
let cachedPromise = null;
const connectDB = async () => {
  // If we have a promise and the connection is actually ALIVE (1 = connected), use it.
  if (cachedPromise && mongoose.connection.readyState === 1) {
    return cachedPromise;
  }

  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/fas_db';

    // Create new connection if none exists or previous one died
    cachedPromise = mongoose.connect(uri, {
      bufferCommands: false, // Return errors immediately if disconnected
      serverSelectionTimeoutMS: 5000 // Fail fast if Mongo is down
    });

    const conn = await cachedPromise;
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Error constructing DB connection: ${error.message}`);
    cachedPromise = null; // Force retry next time
    // We throw here so the middleware knows it failed
    throw error;
  }
};

// Serverless Middleware: Ensure DB is connected before every request
// (Only applies when not running locally)
if (require.main !== module) {
  app.use(async (req, res, next) => {
    // Skip for health check if we want it to report disconnected state (optional, but let's keep it simple)
    if (mongoose.connection.readyState === 1) {
      return next();
    }
    await connectDB();
    next();
  });
}

// Start Server Logic
if (require.main === module) {
  // Local execution (node server.js)
  connectDB().then(() => {
    startServer();
  });
}

module.exports = app;
