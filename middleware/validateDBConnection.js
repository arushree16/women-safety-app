const mongoose = require('mongoose');

const validateDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database connection is not ready'
    });
  }
  next();
};

module.exports = validateDBConnection; 