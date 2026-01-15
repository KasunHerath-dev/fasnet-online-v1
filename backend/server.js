require('dotenv').config(); // Standard config, relies on Vercel Env Vars in production
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./src/utils/logger');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { initializeSocket } = require('./src/socket');

// Prevent crashes from unhandled errors
mongoose.set('strictQuery', false);
mongoose.set('bufferCommands', false); // Fail immediately if disconnected (Serverless Best Practice)

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down gracefully...');
  console.error(err.name, err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥');
  console.error(err.name, err.message);
});

const app = express();

// ==========================================
// MongoDB Connection Pattern for Serverless
// ==========================================
let cachedPromise = null;
const connectDB = async () => {
  // If we have a promise and the connection is actually ALIVE (1 = connected), use it.
  if (cachedPromise && mongoose.connection.readyState === 1) {
    return cachedPromise;
  }

  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/fas_db';

    // Create new connection if none exists or previous one died
    // Mongoose 6+ buffers by default, but explicit connect is safer
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
// (Only applies when not running locally, i.e. on Vercel)
if (require.main !== module) {
  app.use(async (req, res, next) => {
    // Skip for health check if we want it to report disconnected state (optional)
    if (mongoose.connection.readyState === 1) {
      return next();
    }
    try {
      await connectDB();
      next();
    } catch (err) {
      console.error('Vercel DB Startup Error:', err);
      // Determine if we should fail hard or let the route handle it
      // For now, let's continue. If the route needs DB, it will fail there.
      next();
    }
  });
}

// ==========================================
// Middleware Configuration
// ==========================================
app.use(helmet()); // Set security headers
app.use(express.json({ limit: '50mb' })); // Body limit increased for larger uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again in 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
// app.use('/api', limiter); // Disabled for Vercel (Shared IPs cause false positives)

// CORS Configuration
const allowedOrigins = [
  'https://fasnet-online-frontend.vercel.app',
  'https://fasnet-online-v1-frontend.vercel.app',
  'https://www.fasnet-online-v1-frontend.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
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

// ==========================================
// Routes
// ==========================================
app.use('/api/v1/auth', require('./src/routes/authRoutes'));
app.use('/api/v1/users', require('./src/routes/userRoutes'));
app.use('/api/v1/students', require('./src/routes/studentRoutes'));
app.use('/api/v1/academic', require('./src/routes/academicRoutes'));
app.use('/api/v1/progression', require('./src/routes/progressionRoutes'));
app.use('/api/v1/profile-requests', require('./src/routes/profileRequestRoutes'));
app.use('/api/v1/import', require('./src/routes/importRoutes'));
app.use('/api/v1/missing-students', require('./src/routes/missingStudentRoutes'));
app.use('/api/v1/batch-years', require('./src/routes/batchYearRoutes'));
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

// ==========================================
// Server Start (Local vs Vercel)
// ==========================================
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

if (require.main === module) {
  // Local execution
  connectDB().then(() => {
    startServer();
  });
}

// Export app for Vercel
module.exports = app;
