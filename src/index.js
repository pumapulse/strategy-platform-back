require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const discussionRoutes = require('./routes/discussion');
const strategyRoutes = require('./routes/strategy');
const followRoutes = require('./routes/follow');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/strategies', strategyRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Trading Strategy Platform API' });
});

app.use(errorHandler);

// Only call app.listen in non-serverless environments
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
