const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  timestamp: {
    type: Date,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Create a 2dsphere index for geospatial queries
helpRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('HelpRequest', helpRequestSchema); 