const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Partner = require('../models/Partner');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token is in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if this is a partner token
      if (decoded.type === 'partner') {
        req.user = await Partner.findById(decoded.id);
        req.userType = 'partner';
      } else {
        // Regular user token
        req.user = await User.findById(decoded.id);
        req.userType = 'user';
      }

      if (!req.user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
