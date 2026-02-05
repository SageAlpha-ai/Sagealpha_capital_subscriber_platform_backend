const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Report = require('./models/Report');

const app = express();
const PORT = 8000;

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://subscriber.sagealphacapital.com'],// Frontend URL
  credentials: true
}));
app.use(express.json());

// Hardcoded admin credentials
const ADMIN_USERNAME = "sagealphaadmin";
const ADMIN_PASSWORD = "sagealpha@123";

// Basic route
app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  // Validate credentials
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.status(200).json({
      success: true,
      role: "admin",
      message: "Login successful"
    });
  }

  // Invalid credentials
  return res.status(401).json({
    success: false,
    message: "Invalid credentials"
  });
});

// Get SageAlpha Capital reports
app.get('/api/admin/reports', async (req, res) => {
  try {
    const SAGEALPHA_USER_ID = '6982f33d02957fff348ff12b';

    const reports = await Report.find({ user_id: SAGEALPHA_USER_ID })
      .limit(15)
      .sort({ created_at: -1 }) // Latest first
      .lean(); // Return plain JavaScript objects

    return res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
