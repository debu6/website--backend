require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const vehicleBookingRoutes = require('./routes/vehicleBookingRoutes');
const ayurvedaRoutes = require('./routes/ayurvedaRoutes');
const ayurvedaBookingRoutes = require('./routes/ayurvedaBookingRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Connect to database
connectDB();

// CORS Configuration
const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/vehicle-bookings', vehicleBookingRoutes);
app.use('/api/ayurveda/treatments', ayurvedaRoutes);
app.use('/api/ayurveda-bookings', ayurvedaBookingRoutes);
app.use('/api/upload', uploadRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
