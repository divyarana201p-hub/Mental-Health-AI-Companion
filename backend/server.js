require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const app = express();

// Security Middleware
app.use(helmet()); // Secure HTTP headers
app.use(mongoSanitize()); // Prevent NoSQL injection

// Rate limiting for API endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit login attempts to 5 per 15 minutes
  message: 'Too many login attempts, please try again later.'
});

app.use('/api/', limiter);
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser
app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mental-health-ai', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/chat', require('./src/routes/chatRoutes'));
app.use('/api/assessment', require('./src/routes/assessmentRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Backend is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Default error
  res.status(err.status || 500).json({ 
    error: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
