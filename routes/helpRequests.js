const express = require('express');
const router = express.Router();
const HelpRequest = require('../models/HelpRequest');
const validateDBConnection = require('../middleware/validateDBConnection');
const mongoose = require('mongoose');

// Submit a help request
router.post('/help-request', async (req, res) => {
  try {
    const { latitude, longitude, description } = req.body;
    
    // Get current time in IST (UTC+5:30)
    const currentTime = new Date();
    // Add 5 hours and 30 minutes for IST
    currentTime.setHours(currentTime.getHours() + 5);
    currentTime.setMinutes(currentTime.getMinutes() + 30);
    
    const helpRequest = new HelpRequest({
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      timestamp: currentTime,
      description,
      userId: new mongoose.Types.ObjectId()
    });
    
    await helpRequest.save();
    res.status(201).json(helpRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check for nearby incidents
router.get('/check-safety', async (req, res) => {
  try {
    const { latitude, longitude, timeWindow = 24 } = req.query;
    
    // Get current time in IST
    const currentTime = new Date();
    currentTime.setHours(currentTime.getHours() + 5);
    currentTime.setMinutes(currentTime.getMinutes() + 30);
    
    const timeThreshold = new Date(currentTime.getTime() - (timeWindow * 60 * 60 * 1000));
    
    // Find incidents within 500 meters and within time window
    const nearbyIncidents = await HelpRequest.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: 500 // 500 meters radius
        }
      },
      timestamp: {
        $gte: timeThreshold
      },
      status: 'active'
    });
    
    res.json({
      isSafe: nearbyIncidents.length === 0,
      incidents: nearbyIncidents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this new endpoint
router.get('/check-safety-time', async (req, res) => {
  try {
    const { latitude, longitude, hour } = req.query;
    
    // Get current date in IST
    const now = new Date();
    now.setHours(now.getHours() + 5);
    now.setMinutes(now.getMinutes() + 30);
    // Set the specific hour
    now.setHours(parseInt(hour), 0, 0, 0);
    
    // Look for incidents within +/- 1 hour of specified time
    const startTime = new Date(now.getTime() - (60 * 60 * 1000));
    const endTime = new Date(now.getTime() + (60 * 60 * 1000));
    
    const incidents = await HelpRequest.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: 500
        }
      },
      timestamp: {
        $gte: startTime,
        $lte: endTime
      },
      status: 'active'
    });
    
    res.json({
      isSafe: incidents.length === 0,
      incidents: incidents,
      timeChecked: now
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.use(validateDBConnection);

module.exports = router; 