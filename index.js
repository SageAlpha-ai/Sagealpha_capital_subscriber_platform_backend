const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Report = require('./models/Report');
const Subscriber = require('./models/subscriber.model');
require('./config/sagealphacapital.db');

const app = express();
const PORT = 8000;

// Connect to primary (external) MongoDB
connectDB().catch((err) => {
  console.error('Failed to connect to sagealpha db:', err);
  process.exit(1);
});

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://subscriber.sagealphacapital.com',
      'https://sagealpha-capital-subscriber-platform.onrender.com',
    ], // Frontend URL
    credentials: true,
  }),
);
app.use(express.json());

// Hardcoded admin credentials (existing functionality)
const ADMIN_USERNAME = 'sagealphaadmin';
const ADMIN_PASSWORD = 'sagealpha@123';

// Basic route
app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.status(200).json({
      success: true,
      role: 'admin',
      message: 'Login successful',
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid credentials',
  });
});

// Get SageAlpha Capital reports (existing functionality)
app.get('/api/admin/reports', async (req, res) => {
  try {
    const SAGEALPHA_USER_ID = '6982f33d02957fff348ff12b';

    const reports = await Report.find({ user_id: SAGEALPHA_USER_ID })
      .limit(15)
      .sort({ created_at: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message,
    });
  }
});

// Create subscriber (payment details)
app.post('/api/subscribers', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      referralCode,
      transactionId,
      paymentDate,
    } = req.body || {};

    const missingFields = [];
    if (!fullName) missingFields.push('fullName');
    if (!email) missingFields.push('email');
    if (!phoneNumber) missingFields.push('phoneNumber');
    if (!transactionId) missingFields.push('transactionId');
    if (!paymentDate) missingFields.push('paymentDate');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields,
      });
    }

    const parsedPaymentDate = new Date(paymentDate);
    if (Number.isNaN(parsedPaymentDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid paymentDate. Expected a valid date string.',
      });
    }

    const subscriber = new Subscriber({
      fullName,
      email,
      phoneNumber,
      referralCode: referralCode || null,
      transactionId,
      paymentDate: parsedPaymentDate,
    });

    await subscriber.save();

    return res.status(201).json({
      success: true,
      message: 'Subscriber payment details stored successfully',
      data: {
        id: subscriber._id,
        fullName: subscriber.fullName,
        email: subscriber.email,
        phoneNumber: subscriber.phoneNumber,
        referralCode: subscriber.referralCode,
        transactionId: subscriber.transactionId,
        paymentDate: subscriber.paymentDate,
        paymentVerified: subscriber.paymentVerified,
        accessGiven: subscriber.accessGiven,
        createdAt: subscriber.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating subscriber:', error);

    if (error.code === 11000 && error.keyPattern?.transactionId) {
      return res.status(409).json({
        success: false,
        message: 'A subscriber with this transactionId already exists',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to store subscriber payment details',
      error: error.message,
    });
  }
});

// Admin: Get all subscribers
app.get('/api/admin/subscribers', async (req, res) => {
  try {
    const subscribers = await Subscriber.find({})
      .sort({ createdAt: -1 })
      .select('fullName email phoneNumber transactionId paymentDate paymentVerified accessGiven')
      .lean();

    return res.status(200).json({
      success: true,
      data: subscribers,
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers',
      error: error.message,
    });
  }
});

// Admin: Verify payment for a subscriber
app.patch('/api/admin/subscribers/:id/verify-payment', async (req, res) => {
  try {
    const { id } = req.params;

    const subscriber = await Subscriber.findByIdAndUpdate(
      id,
      { paymentVerified: true },
      { new: true, runValidators: true }
    ).select('fullName email phoneNumber transactionId paymentDate paymentVerified accessGiven');

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: subscriber,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message,
    });
  }
});

// Admin: Toggle access for a subscriber
app.patch('/api/admin/subscribers/:id/toggle-access', async (req, res) => {
  try {
    const { id } = req.params;

    const subscriber = await Subscriber.findById(id);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found',
      });
    }

    subscriber.accessGiven = !subscriber.accessGiven;
    await subscriber.save();

    const updatedSubscriber = await Subscriber.findById(id)
      .select('fullName email phoneNumber transactionId paymentDate paymentVerified accessGiven');

    return res.status(200).json({
      success: true,
      data: updatedSubscriber,
    });
  } catch (error) {
    console.error('Error toggling access:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle access',
      error: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
