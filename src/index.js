require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const discussionRoutes = require('./routes/discussion');
const strategyRoutes = require('./routes/strategy');
<<<<<<< HEAD
const followRoutes = require('./routes/follow');
const adminRoutes = require('./routes/admin');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
=======
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

>>>>>>> 088f87957ad536d3d27b403fd3e63ac554ccaa15
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/strategies', strategyRoutes);
<<<<<<< HEAD
app.use('/api/follow', followRoutes);
app.use('/api/admin', adminRoutes);
=======
>>>>>>> 088f87957ad536d3d27b403fd3e63ac554ccaa15

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
=======
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Health check: /health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
>>>>>>> 088f87957ad536d3d27b403fd3e63ac554ccaa15
});
